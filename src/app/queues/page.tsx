'use client';

import React, { useEffect, useState } from 'react';
import { queueService } from '@/services/queue-service';
import { QueueStatus } from '@/types';

export default function QueuesPage() {
  const [queues, setQueues] = useState<QueueStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingName, setActionLoadingName] = useState<string | null>(null);
  const [selectedQueue, setSelectedQueue] = useState<QueueStatus | null>(null);

  async function loadQueues() {
    try {
      setLoading(true);
      const data = await queueService.fetchQueuesStatus();
      setQueues(data);
      // Keep selected queue up to date
      if (selectedQueue) {
        const updated = data.find(q => q.name === selectedQueue.name);
        setSelectedQueue(updated || null);
      }
    } catch (err) {
      console.error('Failed to load BullMQ statuses:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueues();
  }, []);

  const handleRetryFailed = async (queueName: string) => {
    try {
      setActionLoadingName(queueName);
      const result = await queueService.retryFailedJobs(queueName);
      alert(`Successfully queued ${result.count} failed jobs back to waiting in ${queueName}!`);
      await loadQueues();
    } catch (err) {
      alert(`Error retrying failed jobs: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoadingName(null);
    }
  };

  const handleCleanQueue = async (queueName: string, type: 'failed' | 'all') => {
    const msg = type === 'all' 
      ? `Are you sure you want to completely PURGE ALL JOBS (including active/waiting/delayed) in ${queueName}?`
      : `Are you sure you want to clean all failed jobs in ${queueName}?`;
      
    if (!confirm(msg)) return;

    try {
      setActionLoadingName(queueName);
      await queueService.cleanQueue(queueName, type);
      alert(`Cleaned queue ${queueName} successfully!`);
      await loadQueues();
    } catch (err) {
      alert(`Error cleaning queue: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoadingName(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">BullMQ Queues Monitor</h2>
          <p className="text-sm text-slate-500 font-medium">Real-time queue load, active jobs progress monitoring, and failed job retries triggers.</p>
        </div>
        <button
          onClick={loadQueues}
          disabled={loading}
          className="text-sm font-bold px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center gap-2 border border-slate-900"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15.07M11.35 9L15 12.65" />
          </svg>
          Refresh Queues
        </button>
      </div>

      {/* Grid: Queues Cards and Selected Queue Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Queues List */}
        <div className="lg:col-span-2 space-y-4">
          {loading && queues.length === 0 ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
            ))
          ) : (
            queues.map((queue) => {
              const total = queue.active + queue.waiting + queue.delayed + queue.failed;
              const isSelected = selectedQueue?.name === queue.name;
              
              return (
                <div
                  key={queue.name}
                  onClick={() => setSelectedQueue(queue)}
                  className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                    isSelected ? 'ring-2 ring-indigo-500 border-transparent' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-base font-extrabold text-slate-800 tracking-tight block uppercase">
                      {queue.name.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold block">
                      Completed successfully: {queue.completed} jobs
                    </span>
                  </div>

                  {/* Status Numbers */}
                  <div className="flex gap-3 md:gap-4 flex-wrap">
                    <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-center min-w-16">
                      <span className="text-xs font-bold text-indigo-500 block">Active</span>
                      <span className="text-sm font-extrabold text-indigo-700">{queue.active}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-16">
                      <span className="text-xs font-bold text-slate-500 block">Waiting</span>
                      <span className="text-sm font-extrabold text-slate-700">{queue.waiting}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl text-center min-w-16">
                      <span className="text-xs font-bold text-amber-500 block">Delayed</span>
                      <span className="text-sm font-extrabold text-amber-700">{queue.delayed}</span>
                    </div>
                    <div className={`px-3 py-1.5 border rounded-xl text-center min-w-16 ${
                      queue.failed > 0 ? 'bg-rose-50 border-rose-150 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <span className="text-xs font-bold block">Failed</span>
                      <span className="text-sm font-extrabold">{queue.failed}</span>
                    </div>
                  </div>

                  {/* Actions Drawer button */}
                  <div className="flex gap-2 self-end md:self-center" onClick={e => e.stopPropagation()}>
                    {queue.failed > 0 && (
                      <button
                        onClick={() => handleRetryFailed(queue.name)}
                        disabled={actionLoadingName !== null}
                        className="text-xs font-bold px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
                      >
                        Retry Failed
                      </button>
                    )}
                    <button
                      onClick={() => handleCleanQueue(queue.name, 'failed')}
                      disabled={actionLoadingName !== null || queue.failed === 0}
                      className="text-xs font-semibold px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Clean Failed
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Queue Job details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col space-y-6 lg:col-span-1 h-[fit-content]">
          {selectedQueue ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-tight">
                  {selectedQueue.name.replace('_', ' ')} Details
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Explore jobs running inside this queue.</p>
              </div>

              {/* Stats overview */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-sm font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Queue status:</span>
                  <span className="text-indigo-600 font-bold">Active Working</span>
                </div>
                <div className="flex justify-between">
                  <span>Clean completed frequency:</span>
                  <span className="text-slate-500">Auto (Keep 100)</span>
                </div>
              </div>

              {/* Jobs List */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Jobs in queue ({selectedQueue.jobs.length})</span>
                {selectedQueue.jobs.length === 0 ? (
                  <p className="text-xs font-medium text-slate-400 italic">No pending, active or failed jobs listed.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {selectedQueue.jobs.map((job) => (
                      <div key={job.id} className="p-3 border border-slate-150 hover:bg-slate-50/50 rounded-xl space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800 truncate max-w-40">{job.name}</span>
                          <span className={`px-1.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                            job.status === 'active' 
                              ? 'bg-indigo-50 text-indigo-700 animate-pulse'
                              : job.status === 'failed'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {job.status}
                          </span>
                        </div>

                        <div className="font-mono text-[10px] text-slate-400">ID: {job.id}</div>
                        
                        {job.status === 'active' && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                              <span>Progress</span>
                              <span>{job.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${job.progress}%` }}></div>
                            </div>
                          </div>
                        )}

                        {job.status === 'failed' && job.failedReason && (
                          <div className="p-2 bg-rose-50/40 border border-rose-100 rounded text-[10px] text-rose-600 font-medium">
                            <span className="font-bold">Error:</span> {job.failedReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dangerous Queue Actions */}
              <div className="border-t border-slate-150 pt-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dangerous Actions</span>
                <button
                  onClick={() => handleCleanQueue(selectedQueue.name, 'all')}
                  className="w-full text-xs font-bold py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100 rounded-xl transition-colors shadow-sm"
                >
                  Purge & Reset Queue
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-12 h-12 text-slate-350 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <p className="text-sm font-semibold">Select a queue from the list to explore active job details and execution stats.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
