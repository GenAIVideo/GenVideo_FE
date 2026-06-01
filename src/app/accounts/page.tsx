'use client';

import React, { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';
import { accountService } from '@/services/account-service';
import { Account } from '@/types';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  // Add Account form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [username, setUsername] = useState('');
  const [proxy, setProxy] = useState('');
  const [dailyLimit, setDailyLimit] = useState(2);
  const [formSubmitting, setFormSubmitting] = useState(false);

  async function loadAccounts() {
    try {
      setLoading(true);
      const data = await accountService.fetchAccounts();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load accounts list:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      setFormSubmitting(true);
      await accountService.createAccount({
        username: username.trim(),
        proxy: proxy.trim() || undefined,
        daily_limit: dailyLimit,
      });
      setUsername('');
      setProxy('');
      setDailyLimit(2);
      setShowAddForm(false);
      await loadAccounts();
    } catch (err) {
      alert(`Failed to add account: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this TikTok account? This will remove its persistent browser profile.')) {
      return;
    }

    try {
      setActionLoadingId(id);
      await accountService.deleteAccount(id);
      await loadAccounts();
    } catch (err) {
      alert(`Failed to delete account: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleInteractiveLogin = async (id: string) => {
    try {
      setActionLoadingId(id);
      const result = await accountService.triggerInteractiveLogin(id);
      alert(
        `${result.message}\n\nPlease verify authentication or solve captcha on the host browser, then close the browser to save your persistent session!`
      );
      await loadAccounts();
    } catch (err) {
      alert(`Failed to spawn browser: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'cooldown':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'expired':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'banned':
        return 'bg-slate-950 text-slate-200 border-slate-900';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const columns = [
    {
      header: 'TikTok Account Username',
      accessor: (account: Account) => (
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-350"></div>
          <div>
            <span className="font-bold text-slate-900 block">@{account.username}</span>
            <span className="text-[10px] text-slate-400 font-semibold block leading-none mt-0.5">ID: {account.accountId}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (account: Account) => (
        <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full uppercase tracking-wide ${getStatusBadge(account.status)}`}>
          {account.status}
        </span>
      ),
    },
    {
      header: 'Proxy Server Config',
      accessor: (account: Account) => (
        <span className="font-mono text-xs text-slate-500">
          {account.proxy ? account.proxy.split('@')[1] || account.proxy : 'No Proxy (Host Direct)'}
        </span>
      ),
    },
    {
      header: 'Uploads',
      accessor: (account: Account) => (
        <span className="font-bold text-slate-700">
          {account.upload_count} / {account.daily_limit} <span className="text-slate-400 text-xs font-semibold">today</span>
        </span>
      ),
    },
    {
      header: 'Session',
      accessor: (account: Account) => (
        <span className={`text-xs font-semibold ${account.session_persistence ? 'text-emerald-600' : 'text-slate-450'}`}>
          {account.session_persistence ? 'Persistent OK' : 'No Session'}
        </span>
      ),
    },
    {
      header: 'Actions & Session Controls',
      accessor: (account: Account) => (
        <div className="flex items-center gap-2">
          {account.status === 'expired' && (
            <button
              onClick={() => handleInteractiveLogin(account.accountId)}
              disabled={actionLoadingId !== null}
              className="text-xs font-bold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Login Session
            </button>
          )}
          {account.status === 'active' && (
            <button
              onClick={() => handleInteractiveLogin(account.accountId)}
              disabled={actionLoadingId !== null}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
            >
              Re-verify Session
            </button>
          )}
          <button
            onClick={() => handleDeleteAccount(account.accountId)}
            disabled={actionLoadingId !== null}
            className="text-xs font-bold px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg border border-rose-100 transition-colors disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">TikTok Automation Accounts</h2>
          <p className="text-sm text-slate-500 font-medium">Manage multiple TikTok channels. Check session health, configure organic upload windows, and assign unique routing proxies.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm font-bold px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          {showAddForm ? 'Cancel' : 'Link Account'}
        </button>
      </div>

      {/* Add Account Modal Form */}
      {showAddForm && (
        <form onSubmit={handleAddAccount} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4 max-w-xl animate-fadeIn">
          <h3 className="font-bold text-slate-800 text-base">Configure New TikTok Channel</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">TikTok Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="tech_trends"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600 font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Daily Upload Limit</label>
              <input
                type="number"
                min={1}
                max={5}
                required
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">SOCKS5/HTTP Proxy URL (Optional)</label>
            <input
              type="text"
              value={proxy}
              onChange={(e) => setProxy(e.target.value)}
              placeholder="http://username:password@ip:port"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600 font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs font-semibold px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="text-xs font-bold px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {formSubmitting ? 'Linking...' : 'Add & Spawn Verification'}
            </button>
          </div>
        </form>
      )}

      {/* Accounts List DataTable */}
      <DataTable
        data={accounts}
        columns={columns}
        loading={loading}
        emptyMessage="No TikTok channels linked yet."
      />
    </div>
  );
}
