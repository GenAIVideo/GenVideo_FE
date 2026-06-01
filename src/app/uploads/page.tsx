'use client';

import React, { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';
import { uploadService } from '@/services/upload-service';
import { Upload } from '@/types';

export default function UploadsPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUploads() {
    try {
      setLoading(true);
      const data = await uploadService.fetchUploads();
      setUploads(data);
    } catch (err) {
      console.error('Failed to load uploads logs:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUploads();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'failed':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'uploading':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100 animate-pulse';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const columns = [
    {
      header: 'Upload Log ID',
      accessor: (upload: Upload) => <span className="font-mono text-xs text-slate-400 font-bold">#{upload.uploadId}</span>,
    },
    {
      header: 'Video Title',
      accessor: (upload: Upload) => (
        <div>
          <span className="font-semibold text-slate-900 block truncate max-w-xs">{upload.video_title || 'Untitled Video'}</span>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">ID: {upload.video_id}</span>
        </div>
      ),
    },
    {
      header: 'TikTok Account',
      accessor: (upload: Upload) => (
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span className="font-medium text-slate-700">@{upload.account_username || 'unknown'}</span>
        </div>
      ),
    },
    {
      header: 'Scheduled / Uploaded Time',
      accessor: (upload: Upload) => (
        <div className="text-xs font-semibold text-slate-500">
          {upload.uploaded_at ? (
            <div>
              <span className="text-slate-400">Uploaded:</span>{' '}
              {new Date(upload.uploaded_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
            </div>
          ) : (
            <div>
              <span className="text-slate-400">Scheduled:</span>{' '}
              {new Date(upload.scheduled_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Retries log',
      accessor: (upload: Upload) => (
        <span className="text-xs font-bold text-slate-600">
          {upload.retry_count} / {upload.max_retries}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (upload: Upload) => (
        <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full uppercase ${getStatusBadge(upload.status)}`}>
          {upload.status}
        </span>
      ),
    },
    {
      header: 'TikTok Link / Diagnostics',
      accessor: (upload: Upload) => {
        if (upload.status === 'uploaded' && upload.tiktok_post_url) {
          return (
            <a
              href={upload.tiktok_post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View on TikTok
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          );
        }
        if (upload.status === 'failed' && upload.error_message) {
          return (
            <span className="text-xs text-rose-500 font-semibold block truncate max-w-xs" title={upload.error_message}>
              {upload.error_message}
            </span>
          );
        }
        return <span className="text-xs text-slate-400 font-semibold">Queueing...</span>;
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upload Monitoring Center</h2>
          <p className="text-sm text-slate-500 font-medium">Verify multi-account upload windows, scheduled timetables, retry attempts history, and publishing logs.</p>
        </div>
        <button
          onClick={loadUploads}
          disabled={loading}
          className="text-sm font-bold px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center gap-2 border border-slate-900"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15.07M11.35 9L15 12.65" />
          </svg>
          Refresh Logs
        </button>
      </div>

      {/* Uploads list DataTable */}
      <DataTable
        data={uploads}
        columns={columns}
        loading={loading}
        emptyMessage="No upload pipeline jobs enqueued."
      />
    </div>
  );
}
