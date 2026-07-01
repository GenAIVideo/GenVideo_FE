'use client';

import React, { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';
import { videoService } from '@/services/video-service';
import { Video } from '@/types';

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function loadVideos() {
    try {
      setLoading(true);
      const data = await videoService.fetchVideos();
      setVideos(data);
    } catch (err) {
      console.error('Failed to fetch videos list:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideos();
  }, []);

  const handleRetryProcessing = async (id: string) => {
    try {
      setActionLoadingId(id);
      await videoService.retryVideoProcessing(id);
      alert(`Successfully queued reprocessing job for video ID: ${id}`);
      await loadVideos();
    } catch (err) {
      alert(`Error starting retry job: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
      case 'uploaded':
      case 'downloaded':
      case 'ready':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'failed':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'downloading':
      case 'rendering':
      case 'normalizing':
      case 'subtitling':
      case 'remixing':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100 animate-pulse';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const columns = [
    {
      header: 'Video Details',
      accessor: (video: Video) => (
        <div>
          <span className="font-semibold text-slate-900 block truncate max-w-xs">{video.title}</span>
          <span className="text-xs text-slate-400 font-semibold mt-0.5 block">@{video.author}</span>
        </div>
      ),
    },
    {
      header: 'Score',
      accessor: (video: Video) => (
        <span className="text-xs font-bold px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-full">
          {video.viral_score} ★
        </span>
      ),
    },
    {
      header: 'Duration',
      accessor: (video: Video) => <span>{video.duration}s</span>,
    },
    {
      header: 'Engagement',
      accessor: (video: Video) => (
        <div className="text-xs font-semibold text-slate-500">
          <div>Likes: {video.likes?.toLocaleString() || 0}</div>
          <div className="text-[10px] text-slate-400">Comments: {video.comments?.toLocaleString() || 0}</div>
        </div>
      ),
    },
    {
      header: 'Download',
      accessor: (video: Video) => (
        <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full uppercase ${getStatusBadge(video.download_status)}`}>
          {video.download_status}
        </span>
      ),
    },
    {
      header: 'Processing',
      accessor: (video: Video) => (
        <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full uppercase ${getStatusBadge(video.processing_status)}`}>
          {video.processing_status}
        </span>
      ),
    },
    {
      header: 'TikTok Status',
      accessor: (video: Video) => (
        <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full uppercase ${getStatusBadge(video.upload_status)}`}>
          {video.upload_status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (video: Video) => (
        <div className="flex gap-2">
          {video.processing_status === 'failed' && (
            <button
              onClick={() => handleRetryProcessing(video.video_id)}
              disabled={actionLoadingId === video.video_id}
              className="text-xs font-bold px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {actionLoadingId === video.video_id ? 'Queuing...' : 'Retry Process'}
            </button>
          )}
          <span className="text-[10px] text-slate-400 block font-semibold py-1">
            {new Date(video.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Videos Content Hub</h2>
          <p className="text-sm text-slate-500 font-medium">Manage and audit Douyin video assets at various stages of downloading, AI styling, and rendering.</p>
        </div>
        <button
          onClick={loadVideos}
          disabled={loading}
          className="text-sm font-bold px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center gap-2 border border-slate-900"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15.07M11.35 9L15 12.65" />
          </svg>
          Refresh Feed
        </button>
      </div>

      {/* Videos List DataTable */}
      <DataTable
        data={videos}
        columns={columns}
        loading={loading}
        emptyMessage="No media assets seeded in the database."
      />
    </div>
  );
}
