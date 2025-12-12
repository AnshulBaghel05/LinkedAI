// Simple script to test Redis connection
const Redis = require('ioredis');

async function testConnection() {
  console.log('🔍 Testing Upstash Redis connection...\n');

  // Use Redis URL from .env.local
  const redisUrl = 'rediss://default:ATBkAAIncDFmYmY2NTUyMzIxNjg0OTMyOTg2MTljYzhiZWE5YzljZnAxMTIzODg@optimum-walrus-12388.upstash.io:6379';

  if (!redisUrl) {
    console.error('❌ REDIS_URL is not set!');
    process.exit(1);
  }

  console.log('✅ REDIS_URL found');
  console.log(`📍 Connecting to: ${redisUrl.split('@')[1]}\n`);

  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: false,
  });

  redis.on('connect', () => {
    console.log('✅ Connected to Upstash Redis!');
  });

  redis.on('ready', () => {
    console.log('✅ Redis is ready to accept commands');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
  });

  try {
    // Test basic operations
    console.log('\n🧪 Testing basic Redis operations...');

    // SET a test key
    await redis.set('test:bull-queue', 'LinkedAI Scheduler');
    console.log('✅ SET operation successful');

    // GET the test key
    const value = await redis.get('test:bull-queue');
    console.log(`✅ GET operation successful: "${value}"`);

    // DELETE the test key
    await redis.del('test:bull-queue');
    console.log('✅ DEL operation successful');

    // Check current database size
    const dbsize = await redis.dbsize();
    console.log(`📊 Current database size: ${dbsize} keys`);

    console.log('\n🎉 SUCCESS! Upstash Redis is working perfectly!');
    console.log('✅ Bull job queue is ready to use for scheduled posts\n');

    await redis.quit();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await redis.quit();
    process.exit(1);
  }
}

testConnection();
