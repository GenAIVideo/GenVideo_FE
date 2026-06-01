export interface Video {
  video_id: string;
  author: string;
  title: string;
  description?: string;
  duration: number;
  cover_url?: string;
  likes: number;
  plays: number;
  shares?: number;
  comments?: number;
  viral_score: number;
  download_status: 'pending' | 'downloading' | 'downloaded' | 'failed';
  processing_status: 'pending' | 'normalizing' | 'normalized' | 'subtitling' | 'subtitled' | 'remixing' | 'remixed' | 'rendering' | 'processed' | 'failed';
  upload_status: 'pending' | 'ready' | 'uploaded' | 'failed';
  minio_raw_path?: string;
  minio_final_path?: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  accountId: string;
  username: string;
  status: 'active' | 'expired' | 'banned' | 'cooldown';
  upload_count: number;
  daily_limit: number;
  last_upload_at?: string;
  cooldown_until?: string;
  proxy?: string;
  session_persistence: boolean;
  created_at: string;
}

export interface UploadAttempt {
  attempt_number: number;
  timestamp: string;
  status: 'failed' | 'success';
  error_message?: string;
}

export interface Upload {
  uploadId: string;
  video_id: string;
  video_title?: string;
  account_id: string;
  account_username?: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'failed';
  retry_count: number;
  max_retries: number;
  tiktok_post_url?: string;
  error_message?: string;
  attempt_history: UploadAttempt[];
  scheduled_at: string;
  uploaded_at?: string;
}

export interface QueueJob {
  id: string;
  name: string;
  data: any;
  status: 'active' | 'waiting' | 'delayed' | 'failed' | 'completed';
  progress: number;
  timestamp: number;
  failedReason?: string;
}

export interface QueueStatus {
  name: string;
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
  isPaused: boolean;
  jobs: QueueJob[];
}

export interface AnalyticsSummary {
  total_videos_crawled: number;
  total_videos_processed: number;
  total_uploads_attempted: number;
  total_uploads_success: number;
  success_rate: number;
  active_accounts: number;
  upload_by_day: { date: string; success: number; failed: number }[];
  error_breakdown: { reason: string; count: number }[];
}
