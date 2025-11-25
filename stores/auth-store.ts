import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UsageStats, PlanType } from '@/types';

interface AuthStore {
  // User state
  user: User | null;
  isAuthenticated: boolean;

  // Usage stats
  usageStats: UsageStats | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  fetchUsageStats: () => Promise<void>;
  upgradePlan: (plan: PlanType) => Promise<void>;
  updateUsage: (campaignsIncrement: number, rowsIncrement: number) => void;
  canCreateCampaign: (rowCount: number) => { allowed: boolean; reason?: string };
}

// Plan limits
export const PLAN_LIMITS = {
  free: {
    campaignsLimit: 100,
    rowsLimit: 1000, // 100 campaigns × 10 rows each
    features: ['100 campaigns per month', 'Up to 10 rows per campaign', 'Basic templates', 'Email support'],
  },
  starter: {
    campaignsLimit: 20,
    rowsLimit: 1000,
    features: ['20 campaigns per month', 'Up to 50 rows per campaign', 'All templates', 'Priority email support', 'Export to CSV & Excel'],
  },
  pro: {
    campaignsLimit: 100,
    rowsLimit: 10000,
    features: ['100 campaigns per month', 'Up to 100 rows per campaign', 'Custom templates', 'Priority support', 'API access', 'Advanced analytics'],
  },
  enterprise: {
    campaignsLimit: Infinity,
    rowsLimit: Infinity,
    features: ['Unlimited campaigns', 'Unlimited rows', 'Custom integrations', '24/7 dedicated support', 'SLA guarantee', 'On-premise deployment'],
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      usageStats: null,

      login: async (email: string) => {
        // TODO: Replace with actual API call
        // const response = await authApi.login(email, password);
        // set({ user: response.user, isAuthenticated: true });

        // STUB: Mock login
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser: User = {
          id: `user_${Date.now()}`,
          email,
          name: email.split('@')[0],
          plan: 'free',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
          createdAt: new Date().toISOString(),
        };

        set({ user: mockUser, isAuthenticated: true });

        // Fetch usage stats
        await get().fetchUsageStats();
      },

      signup: async (email: string, name: string) => {
        // TODO: Replace with actual API call
        // const response = await authApi.signup(email, password, name);
        // set({ user: response.user, isAuthenticated: true });

        // STUB: Mock signup
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser: User = {
          id: `user_${Date.now()}`,
          email,
          name,
          plan: 'free',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
          createdAt: new Date().toISOString(),
        };

        set({ user: mockUser, isAuthenticated: true });

        // Fetch usage stats
        await get().fetchUsageStats();
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, usageStats: null });
      },

      fetchUsageStats: async () => {
        const user = get().user;
        if (!user) return;

        // TODO: Replace with actual API call
        // const stats = await usageApi.getStats(user.id);
        // set({ usageStats: stats });

        // STUB: Mock usage stats
        await new Promise((resolve) => setTimeout(resolve, 500));

        const limits = PLAN_LIMITS[user.plan];
        const mockStats: UsageStats = {
          userId: user.id,
          campaignsGenerated: 1,
          campaignsLimit: limits.campaignsLimit,
          rowsProcessed: 5,
          rowsLimit: limits.rowsLimit,
          periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          periodEnd: new Date().toISOString(),
        };

        set({ usageStats: mockStats });
      },

      upgradePlan: async (plan: PlanType) => {
        const user = get().user;
        if (!user) return;

        // TODO: Replace with actual API call
        // await billingApi.upgradePlan(user.id, plan);

        // STUB: Mock upgrade
        await new Promise((resolve) => setTimeout(resolve, 1000));

        set({
          user: { ...user, plan },
        });

        // Refresh usage stats with new limits
        await get().fetchUsageStats();
      },

      updateUsage: (campaignsIncrement: number, rowsIncrement: number) => {
        const stats = get().usageStats;
        if (!stats) return;

        set({
          usageStats: {
            ...stats,
            campaignsGenerated: stats.campaignsGenerated + campaignsIncrement,
            rowsProcessed: stats.rowsProcessed + rowsIncrement,
          },
        });

        // TODO: Sync with backend
        // usageApi.updateUsage(stats.userId, campaignsIncrement, rowsIncrement);
      },

      canCreateCampaign: (rowCount: number) => {
        const user = get().user;
        const stats = get().usageStats;

        if (!user || !stats) {
          return { allowed: false, reason: 'User not authenticated' };
        }

        // Check campaign limit
        if (stats.campaignsGenerated >= stats.campaignsLimit) {
          return {
            allowed: false,
            reason: `You've reached your campaign limit (${stats.campaignsLimit} campaigns per month). Please upgrade your plan.`,
          };
        }

        // Check rows limit
        if (stats.rowsProcessed + rowCount > stats.rowsLimit) {
          const remaining = stats.rowsLimit - stats.rowsProcessed;
          return {
            allowed: false,
            reason: `This campaign would exceed your row limit. You have ${remaining} rows remaining this month. Please upgrade your plan or reduce your CSV rows.`,
          };
        }

        return { allowed: true };
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
