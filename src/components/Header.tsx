'use client';

import React, { useEffect, useState } from 'react';
import { isMockMode, setMockMode } from '../services/api-client';

export default function Header() {
  const [useMock, setUseMock] = useState(true);

  useEffect(() => {
    setUseMock(isMockMode());
  }, []);

  const handleToggleMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.checked;
    setUseMock(newVal);
    setMockMode(newVal);
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shadow-sm">
      {/* Search / Breadcrumb Placeholder */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
          Gateway Connected
        </span>
      </div>

      {/* Control Area */}
      <div className="flex items-center gap-6">
        {/* Mock Mode Switcher */}
        <label className="flex items-center cursor-pointer select-none gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-700 block leading-tight">Mock Mode</span>
            <span className="text-[10px] text-slate-400 font-semibold leading-none">
              {useMock ? 'Using mock data' : 'Using Fastify API'}
            </span>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={useMock}
              onChange={handleToggleMock}
            />
            <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${useMock ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-md ${useMock ? 'transform translate-x-4' : ''}`}></div>
          </div>
        </label>

        {/* Vertical Divider */}
        <span className="w-px h-6 bg-slate-200"></span>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-sm font-semibold text-slate-800 block">Hoàng Anh</span>
            <span className="text-[10px] text-slate-400 font-semibold block leading-none">Super Administrator</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
            HA
          </div>
        </div>
      </div>
    </header>
  );
}
