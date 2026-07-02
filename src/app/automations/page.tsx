'use client';

import React, { useState } from 'react';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/automations`;

export default function AutomationsPage() {
  const [reupUrl, setReupUrl] = useState('');
  const [targetLang, setTargetLang] = useState('vi');
  const [persona, setPersona] = useState('horror');
  const [topic, setTopic] = useState('');
  
  const [reupStatus, setReupStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [genStatus, setGenStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loadingReup, setLoadingReup] = useState(false);
  const [loadingGen, setLoadingGen] = useState(false);

  const handleReup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingReup(true);
    setReupStatus(null);
    try {
      const res = await fetch(`${API_BASE}/reup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: reupUrl, targetLanguage: targetLang }),
      });
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) throw new Error(data.message || `Lỗi kết nối API (${res.status})`);
      
      setReupStatus({ type: 'success', text: data.message || 'Đã đưa job vào hàng đợi Reup thành công!' });
      setReupUrl(''); // Reset form on success
    } catch (err: any) {
      setReupStatus({ type: 'error', text: err.message || 'Lỗi không xác định' });
    }
    setLoadingReup(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingGen(true);
    setGenStatus(null);
    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId: persona, topic }),
      });
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) throw new Error(data.message || `Lỗi kết nối API (${res.status})`);
      
      setGenStatus({ type: 'success', text: data.message || 'Đã đưa job vào hàng đợi AI Studio thành công!' });
      setTopic(''); // Reset form on success
    } catch (err: any) {
      setGenStatus({ type: 'error', text: err.message || 'Lỗi không xác định' });
    }
    setLoadingGen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-200 tracking-tight">
            AI Studio & Automations
          </h1>
          <p className="text-slate-300 mt-2 max-w-2xl text-lg font-light leading-relaxed">
            Trung tâm điều khiển tối thượng cho quy trình sản xuất Video. 
            Tự động hóa hoàn toàn từ Localization (Reup) đến GenAI Video Creation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Reup Pipeline Card */}
        <div className="group relative bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_40px_rgb(99,102,241,0.12)] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative p-8 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Reup Pipeline</h2>
                <p className="text-sm font-medium text-indigo-500 mt-0.5">Localization Workflow</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 mb-8 font-medium">Bóc lời ➔ Dịch ➔ Lồng tiếng ➔ Phụ đề ➔ Mix nhạc</p>

            <form onSubmit={handleReup} className="space-y-6 flex-1 flex flex-col">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Video URL (TikTok/YouTube)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </div>
                  <input
                    type="url"
                    required
                    value={reupUrl}
                    onChange={(e) => setReupUrl(e.target.value)}
                    placeholder="https://tiktok.com/@user/video/..."
                    className="w-full bg-white/80 rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Ngôn ngữ đích</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full bg-white/80 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
                >
                  <option value="vi">Tiếng Việt (vi)</option>
                  <option value="en">English (en)</option>
                  <option value="th">Thai (th)</option>
                </select>
              </div>

              <div className="pt-4 mt-auto">
                <button
                  type="submit"
                  disabled={loadingReup}
                  className="relative w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 disabled:opacity-70 overflow-hidden shadow-lg shadow-slate-900/20 group/btn"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {loadingReup ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Đang kích hoạt...
                      </>
                    ) : (
                      'Kích hoạt Reup Pipeline'
                    )}
                  </span>
                </button>
              </div>

              {reupStatus && (
                <div className={`mt-4 p-4 rounded-xl text-sm font-medium border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                  reupStatus.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    reupStatus.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {reupStatus.type === 'success' ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                  {reupStatus.text}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* AI Studio Card */}
        <div className="group relative bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_40px_rgb(168,85,247,0.15)] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative p-8 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">AI Studio</h2>
                <p className="text-sm font-medium text-purple-500 mt-0.5">100% Auto Generation</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 mb-8 font-medium">Sinh Kịch Bản ➔ Sinh Ảnh/Video ➔ Đồng Bộ ➔ Telegram Duyệt</p>

            <form onSubmit={handleGenerate} className="space-y-6 flex-1 flex flex-col">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Bộ não AI (Persona)</label>
                <div className="relative">
                  <select
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    className="w-full bg-white/80 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all appearance-none font-medium"
                  >
                    <option value="horror">Kinh dị (Rùng rợn, giật gân)</option>
                    <option value="true-crime">True-crime (Tội phạm, bí ẩn)</option>
                    <option value="science">Khoa học (Hấp dẫn, sinh động)</option>
                    <option value="finance">Tài chính (Đầu tư, kinh tế)</option>
                    <option value="mythology">Thần thoại (Sử thi, kỳ bí)</option>
                    <option value="history">Lịch sử (Điện ảnh, chân thực)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Chủ đề (Topic / Ý tưởng)</label>
                <textarea
                  rows={4}
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ví dụ: Sự biến mất bí ẩn của chuyến bay MH370..."
                  className="w-full bg-white/80 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all resize-none"
                ></textarea>
              </div>

              <div className="pt-4 mt-auto">
                <button
                  type="submit"
                  disabled={loadingGen}
                  className="relative w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 disabled:opacity-70 overflow-hidden shadow-lg shadow-purple-500/30 group/btn"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {loadingGen ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Đang khởi tạo Studio...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Generate Video (Auto)
                      </>
                    )}
                  </span>
                </button>
              </div>

              {genStatus && (
                <div className={`mt-4 p-4 rounded-xl text-sm font-medium border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                  genStatus.type === 'success' 
                    ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100'
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    genStatus.type === 'success' ? 'bg-fuchsia-100 text-fuchsia-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {genStatus.type === 'success' ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                  {genStatus.text}
                </div>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
