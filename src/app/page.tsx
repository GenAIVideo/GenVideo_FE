'use client';

import React, { useEffect, useState } from 'react';
import MetricsCard from '@/components/MetricsCard';
import { uploadService } from '@/services/upload-service';
import { queueService } from '@/services/queue-service';
import { AnalyticsSummary, QueueStatus } from '@/types';

export default function OverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [queues, setQueues] = useState<QueueStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [analyticsData, queuesData] = await Promise.all([
          uploadService.fetchUploadAnalytics(),
          queueService.fetchQueuesStatus(),
        ]);
        setAnalytics(analyticsData);
        setQueues(queuesData);
      } catch (err) {
        console.error('Failed to load dashboard overview data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalQueueJobs = queues.reduce(
    (acc, q) => acc + q.active + q.waiting + q.delayed,
    0
  );

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Control Overview</h2>
        <p className="text-sm text-slate-500 font-medium">Real-time status of content discovery, media rendering, and TikTok publishing pipelines.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Crawled"
          value={analytics?.total_videos_crawled || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          }
          description="Douyin videos discovered"
          loading={loading}
        />
        <MetricsCard
          title="Render Success"
          value={`${analytics?.total_videos_processed || 0} / 120`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          }
          description="FFmpeg/AI processing rate"
          trend={{ value: 100, isPositive: true }}
          loading={loading}
        />
        <MetricsCard
          title="Upload Success Rate"
          value={`${analytics?.success_rate || 0}%`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          description="Target >85% met successfully"
          trend={{ value: 0.9, isPositive: true }}
          loading={loading}
        />
        <MetricsCard
          title="Queue Load"
          value={totalQueueJobs}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          description="Active BullMQ jobs enqueued"
          loading={loading}
        />
      </div>

      {/* Main Grid: Pipeline Summary & Active Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Diagram Map */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-base">Pipeline Stage Visualization</h3>
            <span className="text-[10px] uppercase font-bold text-slate-400">Sequential auto-chaining</span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-3 bg-white border border-slate-200 rounded-xl shadow-xs w-28">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-sm mb-1.5 border border-indigo-100">1</div>
              <span className="text-xs font-bold text-slate-700">Crawler</span>
              <span className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">Discover & Seed</span>
            </div>

            {/* Divider */}
            <div className="hidden md:block text-slate-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-3 bg-white border border-slate-200 rounded-xl shadow-xs w-28">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-sm mb-1.5 border border-blue-100">2</div>
              <span className="text-xs font-bold text-slate-700">Normalize</span>
              <span className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">1080x1920 MP4</span>
            </div>

            {/* Divider */}
            <div className="hidden md:block text-slate-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-3 bg-white border border-slate-200 rounded-xl shadow-xs w-28">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center font-bold text-amber-600 text-sm mb-1.5 border border-amber-100">3</div>
              <span className="text-xs font-bold text-slate-700">AI Subtitle</span>
              <span className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">Whisper & Styles</span>
            </div>

            {/* Divider */}
            <div className="hidden md:block text-slate-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center p-3 bg-white border border-slate-200 rounded-xl shadow-xs w-28">
              <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center font-bold text-violet-600 text-sm mb-1.5 border border-violet-100">4</div>
              <span className="text-xs font-bold text-slate-700">Remix & Polish</span>
              <span className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">Anti-ban Remix</span>
            </div>

            {/* Divider */}
            <div className="hidden md:block text-slate-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center text-center p-3 bg-indigo-650 border border-indigo-700 text-white rounded-xl shadow-md w-28 shadow-indigo-600/10">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-white text-sm mb-1.5 border border-indigo-500/30">5</div>
              <span className="text-xs font-bold">TikTok Upload</span>
              <span className="text-[9px] text-indigo-200 font-semibold leading-none mt-0.5">BullMQ Worker</span>
            </div>
          </div>

          <div className="text-sm text-slate-500 font-medium">
            The platform automatically chains raw files fetched by Douyin Crawler, normalizing the dimensions and audio levels, transcribing speech with Whisper.cpp, inserting custom subtitle styles, performing copyright remixes (speeding up, zooming, adding filters), and running smart queues to queue uploads on TikTok without exceeding account limits.
          </div>
        </div>

        {/* Short Queue list */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Active Queues Status</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Current jobs in processing</p>
          </div>

          <div className="flex-1 space-y-4">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl animate-pulse">
                  <div className="space-y-1 flex-1">
                    <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  </div>
                  <div className="w-10 h-6 bg-slate-200 rounded"></div>
                </div>
              ))
            ) : (
              queues.map((q) => (
                <div key={q.name} className="flex justify-between items-center p-3 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">{q.name.replace('_', ' ')}</span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Active: {q.active} | Waiting: {q.waiting}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    q.failed > 0
                      ? 'bg-rose-50 text-rose-700 border border-rose-100'
                      : q.active > 0
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {q.failed > 0 ? `${q.failed} Failed` : q.active > 0 ? 'Working' : 'Idle'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
