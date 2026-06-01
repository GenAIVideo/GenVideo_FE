import { Video } from '../types';
import { apiClient, isMockMode } from './api-client';

// High-quality mock data for videos representing different pipeline stages
const MOCK_VIDEOS: Video[] = [
  {
    video_id: 'dy_AI_1779368732901_1',
    author: 'tech_guru',
    title: '5 AI Tools that feel illegal to know in 2026',
    description: 'These AI tools will save you hundreds of hours of work #ai #tech #tools #productivity',
    duration: 15.5,
    likes: 124500,
    plays: 890000,
    shares: 43200,
    comments: 1890,
    viral_score: 9.2,
    download_status: 'downloaded',
    processing_status: 'processed',
    upload_status: 'uploaded',
    minio_raw_path: 'douyin/2026-05/dy_AI_1779368732901_1/dy_AI_1779368732901_1.mp4',
    minio_final_path: 'douyin/final/2026-05/dy_AI_1779368732901_1/dy_AI_1779368732901_1_final.mp4',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    updated_at: new Date(Date.now() - 3600000 * 3.5).toISOString(),
  },
  {
    video_id: 'dy_Tech_1779368338316_2',
    author: 'coding_ninja',
    title: 'Why Next.js 15 is a game changer for SaaS startups',
    description: 'Next.js 15 features you need to use now! #nextjs #react #coding #saas',
    duration: 28.3,
    likes: 45200,
    plays: 320000,
    shares: 12300,
    comments: 654,
    viral_score: 8.5,
    download_status: 'downloaded',
    processing_status: 'processed',
    upload_status: 'ready',
    minio_raw_path: 'douyin/2026-05/dy_Tech_1779368338316_2/dy_Tech_1779368338316_2.mp4',
    minio_final_path: 'douyin/final/2026-05/dy_Tech_1779368338316_2/dy_Tech_1779368338316_2_final.mp4',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hours ago
    updated_at: new Date(Date.now() - 3600000 * 7.5).toISOString(),
  },
  {
    video_id: 'dy_Design_1779368112345_3',
    author: 'ui_ux_daily',
    title: 'Stop using plain colors! Try this dark mode palette',
    description: 'Design a sleek dark mode interface with these HSL values #ui #ux #design #webdesign',
    duration: 42.0,
    likes: 8500,
    plays: 52000,
    shares: 1100,
    comments: 98,
    viral_score: 7.1,
    download_status: 'downloaded',
    processing_status: 'rendering',
    upload_status: 'pending',
    minio_raw_path: 'douyin/2026-05/dy_Design_1779368112345_3/dy_Design_1779368112345_3.mp4',
    created_at: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
    updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    video_id: 'dy_AI_1779368999999_4',
    author: 'ai_creative',
    title: 'How to generate consistent characters with Midjourney',
    description: 'Midjourney character consistency tutorial #midjourney #aiart #tutorial',
    duration: 59.0,
    likes: 3100,
    plays: 15000,
    shares: 420,
    comments: 31,
    viral_score: 6.4,
    download_status: 'downloaded',
    processing_status: 'failed',
    upload_status: 'failed',
    minio_raw_path: 'douyin/2026-05/dy_AI_1779368999999_4/dy_AI_1779368999999_4.mp4',
    created_at: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 110 * 60000).toISOString(),
  },
  {
    video_id: 'dy_Life_1779368888888_5',
    author: 'hustle_hard',
    title: 'My 5 AM routine as a software engineer in Vietnam',
    description: 'Morning routine of a developer #developer #morningroutine #vietnam #productivity',
    duration: 35.1,
    likes: 21000,
    plays: 140000,
    shares: 2500,
    comments: 423,
    viral_score: 8.0,
    download_status: 'downloading',
    processing_status: 'pending',
    upload_status: 'pending',
    created_at: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
    updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
  }
];

export const videoService = {
  fetchVideos: async (): Promise<Video[]> => {
    if (isMockMode()) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...MOCK_VIDEOS]), 400);
      });
    }
    return apiClient.get<Video[]>('/videos');
  },

  fetchVideoById: async (id: string): Promise<Video> => {
    if (isMockMode()) {
      return new Promise((resolve, reject) => {
        const video = MOCK_VIDEOS.find(v => v.video_id === id);
        setTimeout(() => {
          if (video) resolve(video);
          else reject(new Error('Video not found'));
        }, 300);
      });
    }
    return apiClient.get<Video>(`/videos/${id}`);
  },

  retryVideoProcessing: async (id: string): Promise<{ success: boolean; message: string }> => {
    if (isMockMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const video = MOCK_VIDEOS.find(v => v.video_id === id);
          if (video) {
            video.processing_status = 'pending';
            video.upload_status = 'pending';
            video.updated_at = new Date().toISOString();
          }
          resolve({ success: true, message: `Reprocessing triggered for video ${id}` });
        }, 500);
      });
    }
    return apiClient.post<{ success: boolean; message: string }>(`/videos/${id}/retry-process`);
  }
};
