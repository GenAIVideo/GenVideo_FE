'use client';

import React, { useEffect, useState } from 'react';
import { uploadService } from '@/services/upload-service';
import { AnalyticsSummary } from '@/types';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const data = await uploadService.fetchUploadAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load system analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-100 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-96 bg-white border border-slate-100 rounded-2xl lg:col-span-2"></div>
          <div className="h-96 bg-white border border-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const maxVolume = analytics?.upload_by_day.reduce((max, day) => {
    const total = day.success + day.failed;
    return total > max ? total : max;
  }, 5) || 5;

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Performance Analytics</h2>
          <p className="text-sm text-slate-500 font-medium">Deep-dive into video rendering yields, publishing success rates, and anti-ban recovery stats.</p>
        </div>
        <button
          onClick={loadAnalytics}
          className="text-sm font-bold px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center gap-2 border border-slate-900"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15.07M11.35 9L15 12.65" />
          </svg>
          Re-compute Metrics
        </button>
      </div>

      {/* Numerical Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Douyin Videos Crawled</span>
          <span className="text-3xl font-extrabold text-slate-900 block mt-1">{analytics?.total_videos_crawled}</span>
          <span className="text-xs font-semibold text-indigo-600 block mt-1.5">100% deduplicated successfully</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Videos Rendered Yield</span>
          <span className="text-3xl font-extrabold text-slate-900 block mt-1">{analytics?.total_videos_processed}</span>
          <span className="text-xs font-semibold text-emerald-600 block mt-1.5">
            {analytics ? Math.round((analytics.total_videos_processed / analytics.total_videos_crawled) * 100) : 0}% success rate
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Publish Attempts</span>
          <span className="text-3xl font-extrabold text-slate-900 block mt-1">{analytics?.total_uploads_attempted}</span>
          <span className="text-xs font-semibold text-slate-500 block mt-1.5">TikTok API & Playwright automated</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Successful Uploads</span>
          <span className="text-3xl font-extrabold text-emerald-600 block mt-1">{analytics?.total_uploads_success}</span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
            Overall Rate: {analytics?.success_rate}%
          </span>
        </div>
      </div>

      {/* Main Grid: CSS Chart & Error Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CSS Chart: Daily Uploads */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6 flex flex-col">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Daily Publishing Volume</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Success and failed attempts over the last 7 days</p>
          </div>

          {/* Graphic Bar Chart Area */}
          <div className="flex-1 flex items-end justify-between gap-4 h-64 px-4 pt-4 border-b border-slate-250 select-none">
            {analytics?.upload_by_day.map((day) => {
              const total = day.success + day.failed;
              const successPercent = (day.success / maxVolume) * 100;
              const failedPercent = (day.failed / maxVolume) * 100;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group cursor-help">
                  <div className="relative w-full flex flex-col justify-end h-48 gap-0.5">
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      Success: {day.success} | Failed: {day.failed}
                    </div>

                    {/* Failed Stack */}
                    {day.failed > 0 && (
                      <div
                        className="bg-rose-500 w-full rounded-t-sm transition-all duration-300 shadow-sm"
                        style={{ height: `${failedPercent}%` }}
                      ></div>
                    )}

                    {/* Success Stack */}
                    {day.success > 0 && (
                      <div
                        className="bg-indigo-650 w-full rounded-sm transition-all duration-300 shadow-sm"
                        style={{ height: `${successPercent}%` }}
                      ></div>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-slate-450">{day.date}</span>
                </div>
              );
            })}
          </div>

          {/* Chart Legend */}
          <div className="flex gap-6 justify-center text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-indigo-650 inline-block"></span>
              <span className="text-slate-600">Success Upload</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
              <span className="text-slate-600">Failed Attempt</span>
            </div>
          </div>
        </div>

        {/* Error Breakdown list */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Error Reason Breakdown</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Top publishing failure details</p>
          </div>

          <div className="flex-1 divide-y divide-slate-150">
            {analytics?.error_breakdown.map((err) => (
              <div key={err.reason} className="py-3.5 flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-slate-800 font-mono block uppercase">
                    {err.reason.replace('-', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium leading-none block">
                    {err.reason === 'session-expired' && 'Requires manual interactive login session'}
                    {err.reason === 'timeout' && 'Playwright network timeout, automatically retried'}
                    {err.reason === 'captcha-blocked' && 'Manual captcha verification requested'}
                    {err.reason === 'upload-limit-reached' && 'Daily video upload limit reached'}
                  </span>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg shadow-sm">
                  {err.count} times
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
