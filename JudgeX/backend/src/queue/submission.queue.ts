import { Queue, QueueEvents } from 'bullmq';

const redisConnection = {
  host: '127.0.0.1',
  port: 6379,
};

export const submissionQueue = new Queue('submissionQueue', {
  connection: redisConnection,
});

export const queueEvents = new QueueEvents('submissionQueue', {
  connection: redisConnection,
});
