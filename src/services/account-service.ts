import { Account } from '../types';
import { apiClient, isMockMode } from './api-client';

const MOCK_ACCOUNTS: Account[] = [
  {
    accountId: 'acc_01',
    username: 'tech_trends_vietnam',
    status: 'active',
    upload_count: 14,
    daily_limit: 2,
    last_upload_at: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    proxy: 'http://username:password@103.155.101.44:8080',
    session_persistence: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(), // 10 days ago
  },
  {
    accountId: 'acc_02',
    username: 'daily_motivation_ai',
    status: 'cooldown',
    upload_count: 22,
    daily_limit: 2,
    last_upload_at: new Date(Date.now() - 3600000 * 1.5).toISOString(), // 1.5 hours ago
    cooldown_until: new Date(Date.now() + 3600000 * 6.5).toISOString(), // 6.5 hours remaining
    proxy: 'http://username:password@45.138.172.90:3128',
    session_persistence: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 15).toISOString(), // 15 days ago
  },
  {
    accountId: 'acc_03',
    username: 'ai_tool_reviewer',
    status: 'expired',
    upload_count: 8,
    daily_limit: 2,
    last_upload_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    proxy: 'http://username:password@194.67.212.18:8000',
    session_persistence: false,
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), // 5 days ago
  },
  {
    accountId: 'acc_04',
    username: 'viral_clips_hub',
    status: 'banned',
    upload_count: 45,
    daily_limit: 3,
    last_upload_at: new Date(Date.now() - 3600000 * 24 * 12).toISOString(), // 12 days ago
    proxy: undefined,
    session_persistence: true,
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(), // 30 days ago
  }
];

export const accountService = {
  fetchAccounts: async (): Promise<Account[]> => {
    if (isMockMode()) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...MOCK_ACCOUNTS]), 300);
      });
    }
    return apiClient.get<Account[]>('/accounts');
  },

  createAccount: async (data: Partial<Account>): Promise<Account> => {
    if (isMockMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newAccount: Account = {
            accountId: `acc_0${MOCK_ACCOUNTS.length + 1}`,
            username: data.username || 'new_tiktok_account',
            status: 'expired', // Initial status needs manual session sync
            upload_count: 0,
            daily_limit: data.daily_limit || 2,
            proxy: data.proxy,
            session_persistence: false,
            created_at: new Date().toISOString(),
          };
          MOCK_ACCOUNTS.push(newAccount);
          resolve(newAccount);
        }, 500);
      });
    }
    return apiClient.post<Account>('/accounts', data);
  },

  deleteAccount: async (id: string): Promise<{ success: boolean }> => {
    if (isMockMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = MOCK_ACCOUNTS.findIndex(acc => acc.accountId === id);
          if (index !== -1) {
            MOCK_ACCOUNTS.splice(index, 1);
          }
          resolve({ success: true });
        }, 400);
      });
    }
    return apiClient.delete<{ success: boolean }>(`/accounts/${id}`);
  },

  triggerInteractiveLogin: async (id: string): Promise<{ success: boolean; port?: number; message: string }> => {
    if (isMockMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const account = MOCK_ACCOUNTS.find(acc => acc.accountId === id);
          if (account) {
            account.status = 'active';
            account.session_persistence = true;
          }
          resolve({
            success: true,
            port: 9222,
            message: `Interactive login browser spawned successfully. Access it via localhost:9222 for verification.`,
          });
        }, 1500); // Takes longer to mimic browser spawn time
      });
    }
    return apiClient.post<{ success: boolean; port?: number; message: string }>(`/accounts/${id}/interactive-login`);
  }
};
