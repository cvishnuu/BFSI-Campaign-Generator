'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';
import { campaignApi } from '@/lib/api';
import { UsageStats, User } from '@/types';
import { PLAN_LIMITS } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  TrendingUp,
  Calendar,
  Crown,
  ArrowRight,
  FileText,
  Clock,
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [appUser, setAppUser] = useState<User | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoaded) return;
      if (!isSignedIn) {
        router.push('/login');
        return;
      }

      try {
        setAppUser({
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          name: clerkUser.fullName || '',
          plan: 'free',
          createdAt: new Date().toISOString(),
        });
        setUsageStats({
          userId: clerkUser.id,
          campaignsGenerated: 0,
          campaignsLimit: PLAN_LIMITS.free.campaignsLimit,
          rowsProcessed: 0,
          rowsLimit: PLAN_LIMITS.free.rowsLimit,
          periodStart: new Date().toISOString(),
          periodEnd: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      }
    };

    loadProfile();
  }, [isLoaded, isSignedIn, getToken, router, clerkUser]);

  if (!isLoaded || !isSignedIn || !appUser || !usageStats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-gray-900">Loading...</div>
      </div>
    );
  }

  const displayName =
    appUser.name ||
    clerkUser?.fullName ||
    clerkUser?.primaryEmailAddress?.emailAddress ||
    'User';
  const planLimits = PLAN_LIMITS[appUser.plan];
  const campaignUsagePercent = (usageStats.campaignsGenerated / usageStats.campaignsLimit) * 100;
  const rowUsagePercent = (usageStats.rowsProcessed / usageStats.rowsLimit) * 100;

  // Calculate trial days remaining
  const trialDaysRemaining = appUser.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(appUser.trialEndsAt).getTime() - now) / (1000 * 60 * 60 * 24)))
    : null;

  const planBadgeVariant = {
    free: 'secondary' as const,
    starter: 'default' as const,
    pro: 'default' as const,
    enterprise: 'default' as const,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">BFSI Campaign Generator</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gray-900 font-semibold">Dashboard</Button>
            </Link>
            <Link href="/create">
              <Button variant="default" className="bg-blue-600 text-white font-semibold">
                Create Campaign
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Welcome back, {displayName}!
          </h1>
          <p className="text-gray-700">
            Here&apos;s an overview of your account and usage statistics.
          </p>
        </div>

        {/* Trial Alert */}
        {appUser.plan === 'free' && trialDaysRemaining !== null && trialDaysRemaining <= 7 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    {trialDaysRemaining === 0
                      ? 'Your trial expires today!'
                      : `${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'day' : 'days'} left in your trial`}
                  </p>
                  <p className="text-sm text-yellow-800">
                    Upgrade now to continue generating campaigns without interruption
                  </p>
                </div>
              </div>
              <Link href="/pricing">
                <Button variant="default" className="bg-yellow-600 text-white hover:bg-yellow-700">
                  Upgrade Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Plan Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-900">Current Plan</CardTitle>
                <Crown className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={planBadgeVariant[appUser.plan]} className="text-base px-3 py-1">
                  {appUser.plan.charAt(0).toUpperCase() + appUser.plan.slice(1)}
                </Badge>
              </div>
              {appUser.plan === 'free' && trialDaysRemaining !== null && (
                <p className="text-sm text-gray-700 mb-4">
                  Trial ends in {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'}
                </p>
              )}
              <Link href="/pricing">
                <Button variant="outline" className="w-full text-gray-900 border-gray-300">
                  {appUser.plan === 'enterprise' ? 'Manage Plan' : 'Upgrade Plan'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Campaign Usage Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-900">Campaigns</CardTitle>
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <CardDescription>This billing period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold text-gray-900">
                    {usageStats.campaignsGenerated}
                  </span>
                  <span className="text-sm text-gray-700">
                    of {usageStats.campaignsLimit === -1 ? 'unlimited' : usageStats.campaignsLimit}
                  </span>
                </div>
                {usageStats.campaignsLimit !== -1 && (
                  <Progress value={campaignUsagePercent} className="h-2" />
                )}
                {campaignUsagePercent >= 80 && usageStats.campaignsLimit !== -1 && (
                  <p className="text-xs text-yellow-700">
                    You&apos;re running low on campaigns. Consider upgrading.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rows Processed Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-900">Rows Processed</CardTitle>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <CardDescription>This billing period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold text-gray-900">
                    {usageStats.rowsProcessed}
                  </span>
                  <span className="text-sm text-gray-700">
                    of {usageStats.rowsLimit === -1 ? 'unlimited' : usageStats.rowsLimit.toLocaleString()}
                  </span>
                </div>
                {usageStats.rowsLimit !== -1 && (
                  <Progress value={rowUsagePercent} className="h-2" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-gray-900">Quick Actions</CardTitle>
            <CardDescription>Get started with your campaign generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/create" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1 text-gray-900">Create New Campaign</h3>
                        <p className="text-sm text-gray-700">
                          Upload CSV and generate personalized messages
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/pricing" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1 text-gray-900">View Pricing Plans</h3>
                        <p className="text-sm text-gray-700">
                          Upgrade for more campaigns and features
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Plan Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Your Plan Includes</CardTitle>
            <CardDescription>Features available in your current plan</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-3">
              {planLimits.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-900">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Billing Period Info */}
        <div className="mt-6 text-center text-sm text-gray-700">
          <Calendar className="w-4 h-4 inline mr-1" />
          Current billing period: {new Date(usageStats.periodStart).toLocaleDateString()} -{' '}
          {new Date(usageStats.periodEnd).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
