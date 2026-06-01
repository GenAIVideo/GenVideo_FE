import { QueueStatus } from '../types';
import { apiClient, isMockMode } from './api-client';

const MOCK_QUEUES: QueueStatus[] = [
  {
    name: 'crawler_queue',
    waiting: 2,
    active: 0,
    delayed: 0,
    failed: 1,
    completed: 45,
    isPaused: false,
    jobs: [
      { id: '1', name: 'crawl-hashtag', data: { hashtag: 'AI', limit: 5 }, status: 'waiting', progress: 0, timestamp: Date.now() - 60000 },
      { id: '2', name: 'crawl-hashtag', data: { hashtag: 'coding', limit: 3 }, status: 'waiting', progress: 0, timestamp: Date.now() - 30000 },
      { id: '3', name: 'crawl-hashtag', data: { hashtag: 'tech' }, status: 'failed', progress: 0, timestamp: Date.now() - 7200000, failedReason: 'API Rate limit exceeded' },
    ]
  },
  {
    name: 'normalize_queue',
    waiting: 0,
    active: 1,
    delayed: 0,
    failed: 0,
    completed: 38,
    isPaused: false,
    jobs: [
      { id: 'normalize-dy_Life_1779368888888_5', name: 'normalize-video', data: { videoId: 'dy_Life_1779368888888_5' }, status: 'active', progress: 45, timestamp: Date.now() - 15000 },
    ]
  },
  {
    name: 'subtitle_queue',
    waiting: 0,
    active: 0,
    delayed: 0,
    failed: 0,
    completed: 37,
    isPaused: false,
    jobs: []
  },
  {
    name: 'remix_queue',
    waiting: 0,
    active: 0,
    delayed: 0,
    failed: 0,
    completed: 36,
    isPaused: false,
    jobs: []
  },
  {
    name: 'render_queue',
    waiting: 0,
    active: 1,
    delayed: 0,
    failed: 1,
    completed: 35,
    isPaused: false,
    jobs: [
      { id: 'render-dy_Design_1779368112345_3', name: 'render-video', data: { videoId: 'dy_Design_1779368112345_3' }, status: 'active', progress: 12, timestamp: Date.now() - 5000 },
      { id: 'render-dy_AI_1779368999999_4', name: 'render-video', data: { videoId: 'dy_AI_1779368999999_4' }, status: 'failed', progress: 0, timestamp: Date.now() - 3600000, failedReason: 'FFmpeg execution failure: Out of memory' },
    ]
  },
  {
    name: 'upload_queue',
    waiting: 1,
    active: 0,
    delayed: 1,
    failed: 3,
    completed: 55,
    isPaused: false,
    jobs: [
      { id: 'upload-dy_Tech_1779368338316_2', name: 'upload-video', data: { videoId: 'dy_Tech_1779368338316_2' }, status: 'delayed', progress: 0, timestamp: Date.now() - 5400000 },
      { id: 'upload-dy_AI_1779368999999_4', name: 'upload-video', data: { videoId: 'dy_AI_1779368999999_4' }, status: 'failed', progress: 0, timestamp: Date.now() - 14400000, failedReason: 'session-expired' },
    ]
  }
];

export const queueService = {
  fetchQueuesStatus: async (): Promise<QueueStatus[]> => {
    if (isMockMode()) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...MOCK_QUEUES]), 300);
      });
    }
    return apiClient.get<QueueStatus[]>('/queues');
  },

  retryFailedJobs: async (queueName: string): Promise<{ success: boolean; count: number }> => {
    if (isMockMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const queue = MOCK_QUEUES.find(q => q.name === queueName);
          let count = 0;
          if (queue) {
            count = queue.failed;
            queue.waiting += queue.failed;
            queue.failed = 0;
            // Map failed jobs in the queue to waiting
            queue.jobs = queue.jobs.map(job => {
              if (job.status === 'failed') {
                return { ...job, status: 'waiting', failedReason: undefined };
              }
              return job;
            });
          }
          resolve({ success: true, count });
        }, 500);
      });
    }
    return apiClient.post<{ success: boolean; count: number }>(`/queues/${queueName}/retry`);
  },

  cleanQueue: async (queueName: string, type: 'failed' | 'completed' | 'all' = 'failed'): Promise<{ success: boolean }> => {
    if (isMockMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const queue = MOCK_QUEUES.find(q => q.name === queueName);
          if (queue) {
            if (type === 'failed') {
              queue.failed = 0;
              queue.jobs = queue.jobs.filter(j => j.status !== 'failed');
            } else if (type === 'completed') {
              queue.completed = 0;
              queue.jobs = queue.jobs.filter(j => j.status !== 'completed');
            } else {
              queue.waiting = 0;
              queue.active = 0;
              queue.delayed = 0;
              queue.failed = 0;
              queue.completed = 0;
              queue.jobs = [];
            }
          }
          resolve({ success: true });
        }, 400);
      });
    }
    return apiClient.post<{ success: boolean }>(`/queues/${queueName}/clean`, { type });
  }
};
