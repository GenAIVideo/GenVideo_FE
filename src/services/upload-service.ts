import { Upload, AnalyticsSummary } from '../types';
import { apiClient, isMockMode } from './api-client';

const MOCK_UPLOADS: Upload[] = [
  {
    uploadId: 'up_101',
    video_id: 'dy_AI_1779368732901_1',
    video_title: '5 AI Tools that feel illegal to know in 2026',
    account_id: 'acc_01',
    account_username: 'tech_trends_vietnam',
    status: 'uploaded',
    retry_count: 0,
    max_retries: 3,
    tiktok_post_url: 'https://www.tiktok.com/@tech_trends_vietnam/video/7348912839481239841',
    attempt_history: [
      { attempt_number: 1, timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), status: 'success' }
    ],
    scheduled_at: new Date(Date.now() - 3600000 * 4.5).toISOString(),
    uploaded_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    uploadId: 'up_102',
    video_id: 'dy_Tech_1779368338316_2',
    video_title: 'Why Next.js 15 is a game changer for SaaS startups',
    account_id: 'acc_02',
    account_username: 'daily_motivation_ai',
    status: 'pending',
    retry_count: 0,
    max_retries: 3,
    attempt_history: [],
    scheduled_at: new Date(Date.now() + 3600000 * 2).toISOString(), // Scheduled in 2 hours
  },
  {
    uploadId: 'up_103',
    video_id: 'dy_Design_1779368112345_3',
    video_title: 'Stop using plain colors! Try this dark mode palette',
    account_id: 'acc_01',
    account_username: 'tech_trends_vietnam',
    status: 'pending',
    retry_count: 0,
    max_retries: 3,
    attempt_history: [],
    scheduled_at: new Date(Date.now() + 3600000 * 4).toISOString(), // Scheduled in 4 hours
  },
  {
    uploadId: 'up_104',
    video_id: 'dy_AI_1779368999999_4',
    video_title: 'How to generate consistent characters with Midjourney',
    account_id: 'acc_03',
    account_username: 'ai_tool_reviewer',
    status: 'failed',
    retry_count: 3,
    max_retries: 3,
    error_message: 'Max retry attempts reached. Reason: session-expired on account login stage.',
    attempt_history: [
      { attempt_number: 1, timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), status: 'failed', error_message: 'timeout' },
      { attempt_number: 2, timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), status: 'failed', error_message: 'timeout' },
      { attempt_number: 3, timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), status: 'failed', error_message: 'session-expired' }
    ],
    scheduled_at: new Date(Date.now() - 3600000 * 6.5).toISOString(),
  }
];

const MOCK_ANALYTICS: AnalyticsSummary = {
  total_videos_crawled: 120,
  total_videos_processed: 85,
  total_uploads_attempted: 64,
  total_uploads_success: 55,
  success_rate: 85.9,
  active_accounts: 3,
  upload_by_day: [
    { date: '05-17', success: 6, failed: 1 },
    { date: '05-18', success: 8, failed: 0 },
    { date: '05-19', success: 7, failed: 2 },
    { date: '05-20', success: 9, failed: 1 },
    { date: '05-21', success: 10, failed: 0 },
    { date: '05-22', success: 7, failed: 3 },
    { date: '05-23', success: 8, failed: 2 },
  ],
  error_breakdown: [
    { reason: 'timeout', count: 4 },
    { reason: 'session-expired', count: 3 },
    { reason: 'captcha-blocked', count: 1 },
    { reason: 'upload-limit-reached', count: 1 }
  ]
};

export const uploadService = {
  fetchUploads: async (): Promise<Upload[]> => {
    if (isMockMode()) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...MOCK_UPLOADS]), 350);
      });
    }
    return apiClient.get<Upload[]>('/uploads');
  },

  fetchUploadAnalytics: async (): Promise<AnalyticsSummary> => {
    if (isMockMode()) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ ...MOCK_ANALYTICS }), 400);
      });
    }
    return apiClient.get<AnalyticsSummary>('/analytics/summary');
  }
};
