'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PollingResult {
  published: number
  total?: number
  message?: string
}

interface UseScheduledPostsPollingOptions {
  enabled?: boolean
  interval?: number // in milliseconds, default 60000 (1 minute)
  onPublish?: (result: PollingResult) => void
}

export function useScheduledPostsPolling(options: UseScheduledPostsPollingOptions = {}) {
  const {
    enabled = true,
    interval = 60000, // Default: check every 60 seconds
    onPublish,
  } = options

  const [isPolling, setIsPolling] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const checkAndPublish = async () => {
    if (isPolling) return // Prevent concurrent requests

    setIsPolling(true)

    try {
      const response = await fetch('/api/scheduled-posts/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to check scheduled posts')
      }

      const result: PollingResult = await response.json()
      setLastChecked(new Date())

      // If posts were published, notify and refresh
      if (result.published > 0) {
        console.log(`✅ Published ${result.published} scheduled post(s)`)

        if (onPublish) {
          onPublish(result)
        }

        // Refresh the current page to show updated post statuses
        router.refresh()
      }
    } catch (error) {
      console.error('Error checking scheduled posts:', error)
    } finally {
      setIsPolling(false)
    }
  }

  useEffect(() => {
    if (!enabled) {
      // Clear interval if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Initial check immediately
    checkAndPublish()

    // Set up interval for polling
    intervalRef.current = setInterval(() => {
      checkAndPublish()
    }, interval)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, interval])

  return {
    isPolling,
    lastChecked,
    checkNow: checkAndPublish,
  }
}
