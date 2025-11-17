/**
 * Auth Store Tests
 * Target: 95% coverage
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, PLAN_LIMITS } from '@/stores/auth-store';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      usageStats: null,
    });
  });

  describe('login', () => {
    it('should authenticate user successfully', async () => {
      const { login } = useAuthStore.getState();

      await login('test@example.com', 'password123');

      const { user, isAuthenticated } = useAuthStore.getState();

      expect(isAuthenticated).toBe(true);
      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
      expect(user?.plan).toBe('free');
    });

    it('should fetch usage stats after login', async () => {
      const { login } = useAuthStore.getState();

      await login('test@example.com', 'password123');

      const { usageStats } = useAuthStore.getState();

      expect(usageStats).not.toBeNull();
      expect(usageStats?.campaignsGenerated).toBeDefined();
      expect(usageStats?.rowsProcessed).toBeDefined();
    });
  });

  describe('signup', () => {
    it('should create new user successfully', async () => {
      const { signup } = useAuthStore.getState();

      await signup('newuser@example.com', 'password123', 'New User');

      const { user, isAuthenticated } = useAuthStore.getState();

      expect(isAuthenticated).toBe(true);
      expect(user).not.toBeNull();
      expect(user?.email).toBe('newuser@example.com');
      expect(user?.name).toBe('New User');
      expect(user?.plan).toBe('free');
    });

    it('should set trial end date for new users', async () => {
      const { signup } = useAuthStore.getState();

      await signup('newuser@example.com', 'password123', 'New User');

      const { user } = useAuthStore.getState();

      expect(user?.trialEndsAt).toBeDefined();
      const trialEnd = new Date(user!.trialEndsAt!);
      const now = new Date();
      const daysDiff = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysDiff).toBeGreaterThanOrEqual(13);
      expect(daysDiff).toBeLessThanOrEqual(15);
    });
  });

  describe('logout', () => {
    it('should clear user state', async () => {
      const { login, logout } = useAuthStore.getState();

      await login('test@example.com', 'password123');
      logout();

      const { user, isAuthenticated, usageStats } = useAuthStore.getState();

      expect(isAuthenticated).toBe(false);
      expect(user).toBeNull();
      expect(usageStats).toBeNull();
    });
  });

  describe('fetchUsageStats', () => {
    it('should fetch usage stats for authenticated user', async () => {
      const { login, fetchUsageStats } = useAuthStore.getState();

      await login('test@example.com', 'password123');
      await fetchUsageStats();

      const { usageStats } = useAuthStore.getState();

      expect(usageStats).not.toBeNull();
      expect(usageStats?.campaignsGenerated).toBeDefined();
      expect(usageStats?.campaignsLimit).toBe(PLAN_LIMITS.free.campaignsLimit);
      expect(usageStats?.rowsLimit).toBe(PLAN_LIMITS.free.rowsLimit);
    });

    it('should not fetch stats if user not authenticated', async () => {
      const { fetchUsageStats } = useAuthStore.getState();

      await fetchUsageStats();

      const { usageStats } = useAuthStore.getState();

      expect(usageStats).toBeNull();
    });
  });

  describe('upgradePlan', () => {
    it('should upgrade user plan successfully', async () => {
      const { login, upgradePlan } = useAuthStore.getState();

      await login('test@example.com', 'password123');
      await upgradePlan('pro');

      const { user, usageStats } = useAuthStore.getState();

      expect(user?.plan).toBe('pro');
      expect(usageStats?.campaignsLimit).toBe(PLAN_LIMITS.pro.campaignsLimit);
      expect(usageStats?.rowsLimit).toBe(PLAN_LIMITS.pro.rowsLimit);
    });

    it('should not upgrade if user not authenticated', async () => {
      const { upgradePlan } = useAuthStore.getState();

      await upgradePlan('pro');

      const { user } = useAuthStore.getState();

      expect(user).toBeNull();
    });
  });

  describe('updateUsage', () => {
    it('should increment usage counters', async () => {
      const { login, updateUsage } = useAuthStore.getState();

      await login('test@example.com', 'password123');

      const initialStats = useAuthStore.getState().usageStats;
      const initialCampaigns = initialStats!.campaignsGenerated;
      const initialRows = initialStats!.rowsProcessed;

      updateUsage(1, 10);

      const { usageStats } = useAuthStore.getState();

      expect(usageStats?.campaignsGenerated).toBe(initialCampaigns + 1);
      expect(usageStats?.rowsProcessed).toBe(initialRows + 10);
    });

    it('should handle multiple usage updates', async () => {
      const { login, updateUsage } = useAuthStore.getState();

      await login('test@example.com', 'password123');

      updateUsage(1, 5);
      updateUsage(1, 10);

      const { usageStats } = useAuthStore.getState();

      expect(usageStats?.campaignsGenerated).toBe(3); // 1 initial + 1 + 1
      expect(usageStats?.rowsProcessed).toBe(20); // 5 initial + 5 + 10
    });

    it('should not update if no stats available', () => {
      const { updateUsage } = useAuthStore.getState();

      updateUsage(1, 10);

      const { usageStats } = useAuthStore.getState();

      expect(usageStats).toBeNull();
    });
  });

  describe('canCreateCampaign', () => {
    it('should allow campaign creation within limits', async () => {
      const { login, canCreateCampaign } = useAuthStore.getState();

      await login('test@example.com', 'password123');

      const result = canCreateCampaign(5);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should block campaign creation when campaign limit reached', async () => {
      const { login, updateUsage, canCreateCampaign } = useAuthStore.getState();

      await login('test@example.com', 'password123');
      updateUsage(2, 0); // Now at limit (1 initial + 2 = 3)

      const result = canCreateCampaign(5);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('campaign limit');
    });

    it('should block campaign creation when row limit would be exceeded', async () => {
      const { login, updateUsage, canCreateCampaign } = useAuthStore.getState();

      await login('test@example.com', 'password123');
      updateUsage(0, 20); // Now at 25 rows processed

      const result = canCreateCampaign(10); // Would exceed 30 row limit

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('row limit');
      expect(result.reason).toContain('5 rows remaining');
    });

    it('should block if user not authenticated', () => {
      const { canCreateCampaign } = useAuthStore.getState();

      const result = canCreateCampaign(5);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('User not authenticated');
    });

    it('should allow unlimited campaigns for enterprise plan', async () => {
      const { login, upgradePlan, updateUsage, canCreateCampaign } = useAuthStore.getState();

      await login('test@example.com', 'password123');
      await upgradePlan('enterprise');
      updateUsage(100, 10000); // Way over free limits

      const result = canCreateCampaign(1000);

      expect(result.allowed).toBe(true);
    });
  });

  describe('PLAN_LIMITS', () => {
    it('should have correct limits for free plan', () => {
      expect(PLAN_LIMITS.free.campaignsLimit).toBe(3);
      expect(PLAN_LIMITS.free.rowsLimit).toBe(30);
      expect(PLAN_LIMITS.free.features).toHaveLength(4);
    });

    it('should have correct limits for starter plan', () => {
      expect(PLAN_LIMITS.starter.campaignsLimit).toBe(20);
      expect(PLAN_LIMITS.starter.rowsLimit).toBe(1000);
      expect(PLAN_LIMITS.starter.features).toContain('Priority email support');
    });

    it('should have correct limits for pro plan', () => {
      expect(PLAN_LIMITS.pro.campaignsLimit).toBe(100);
      expect(PLAN_LIMITS.pro.rowsLimit).toBe(10000);
      expect(PLAN_LIMITS.pro.features).toContain('API access');
    });

    it('should have unlimited limits for enterprise plan', () => {
      expect(PLAN_LIMITS.enterprise.campaignsLimit).toBe(Infinity);
      expect(PLAN_LIMITS.enterprise.rowsLimit).toBe(Infinity);
      expect(PLAN_LIMITS.enterprise.features).toContain('On-premise deployment');
    });
  });
});
