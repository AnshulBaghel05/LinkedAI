import Redis from 'ioredis'
import { QueueOptions } from 'bull'

// Redis connection configuration
export function createRedisConnection() {
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set')
  }

  // Parse Redis URL
  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Required for Bull - blocking commands
    enableReadyCheck: false,
    // Optimize for serverless environments
    lazyConnect: true,
    connectionName: 'linkedai-queue',
    // Handle disconnections gracefully
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    // Reconnect on error
    reconnectOnError(err) {
      const targetError = 'READONLY'
      if (err.message.includes(targetError)) {
        // Only reconnect when the error contains "READONLY"
        return true
      }
      return false
    },
  })

  // Handle connection events
  redis.on('connect', () => {
    console.log('[Redis] Connected to Upstash Redis')
  })

  redis.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message)
  })

  redis.on('close', () => {
    console.log('[Redis] Connection closed')
  })

  return redis
}

// Bull queue options
export const defaultQueueOptions: QueueOptions = {
  createClient: (type) => {
    console.log(`[Bull] Creating Redis client for: ${type}`)
    return createRedisConnection()
  },
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5s delay, then 10s, then 20s
    },
    removeOnComplete: true, // Clean up completed jobs
    removeOnFail: false, // Keep failed jobs for debugging
  },
  settings: {
    stalledInterval: 30000, // Check for stalled jobs every 30s
    maxStalledCount: 3, // Max stalled retries
  },
}

// Queue names
export const QUEUE_NAMES = {
  SCHEDULED_POSTS: 'scheduled-posts',
} as const

// Job names
export const JOB_NAMES = {
  PUBLISH_POST: 'publish-post',
} as const
