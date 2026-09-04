import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');

export const connection = new IORedis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  retryStrategy(times) {
    return Math.min(times * 1000, 10000);
  }
});

export let isRedisConnected = false;

connection.on('connect', () => {
  isRedisConnected = true;
  console.log('[Redis] Connected to Redis server.');
});

connection.on('error', (_err) => {
  isRedisConnected = false;
  // Suppress ECONNREFUSED error spam when Redis server is offline
});

export const submissionQueue = new Queue('submissionQueue', {
  connection: connection as any,
});

export const queueEvents = new QueueEvents('submissionQueue', {
  connection: connection as any,
});

