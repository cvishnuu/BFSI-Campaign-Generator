'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Check,
  Zap,
  Crown,
  Building2,
  ArrowRight,
} from 'lucide-react';

export default function Pricing() {
  const { user, isAuthenticated } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Free',
      planType: 'free' as const,
      description: 'Perfect for trying out the platform',
      price: { monthly: 0, annual: 0 },
      icon: Sparkles,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-100',
      features: [
        '3 campaigns per month',
        'Up to 10 rows per campaign',
        'Basic templates',
        'Email support',
        '14-day free trial',
        'Compliance checking',
      ],
      limitations: [
        'Limited campaign volume',
        'Basic features only',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Starter',
      planType: 'starter' as const,
      description: 'For small teams getting started',
      price: { monthly: 49, annual: 470 },
      icon: Zap,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      features: [
        '20 campaigns per month',
        'Up to 50 rows per campaign',
        'All templates',
        'Priority email support',
        'Advanced AI customization',
        'Compliance checking',
        'Export to CSV & Excel',
        'Campaign analytics',
      ],
      limitations: [],
      cta: 'Get Started',
      highlighted: true,
    },
    {
      name: 'Pro',
      planType: 'pro' as const,
      description: 'For growing organizations',
      price: { monthly: 149, annual: 1430 },
      icon: Crown,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      features: [
        '100 campaigns per month',
        'Up to 100 rows per campaign',
        'All templates + custom templates',
        'Priority phone & email support',
        'Advanced AI customization',
        'Compliance checking',
        'Export to CSV & Excel',
        'Campaign analytics',
        'Team collaboration',
        'API access',
      ],
      limitations: [],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Enterprise',
      planType: 'enterprise' as const,
      description: 'For large-scale operations',
      price: { monthly: null, annual: null },
      icon: Building2,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      features: [
        'Unlimited campaigns',
        'Unlimited rows per campaign',
        'Custom templates',
        'Dedicated account manager',
        'Advanced AI customization',
        'Compliance checking',
        'Export to all formats',
        'Advanced analytics',
        'Team collaboration',
        'API access',
        'Custom integrations',
        'SLA guarantee',
        'On-premise deployment option',
      ],
      limitations: [],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  const savings = (monthly: number, annual: number) => {
    const monthlyCost = monthly * 12;
    const saved = monthlyCost - annual;
    const percentage = Math.round((saved / monthlyCost) * 100);
    return { saved, percentage };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">BFSI Campaign Generator</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost" className="text-gray-900 font-semibold">Pricing</Button>
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" className="text-gray-900 font-semibold border-gray-300">Dashboard</Button>
                </Link>
                <Link href="/create">
                  <Button variant="default" className="bg-blue-600 text-white font-semibold">Create Campaign</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="text-gray-900 font-semibold border-gray-300">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" className="bg-blue-600 text-white font-semibold">Sign Up Free</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-6" variant="secondary">
          <Sparkles className="w-3 h-3 mr-1" />
          Simple, transparent pricing
        </Badge>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
          Choose the Perfect Plan
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            for Your Business
          </span>
        </h1>

        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Start with a free trial. Upgrade anytime. No credit card required to get started.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-700'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === 'annual' ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-700'}`}>
            Annual
          </span>
          {billingCycle === 'annual' && (
            <Badge variant="success" className="ml-2">
              Save up to 20%
            </Badge>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const PlanIcon = plan.icon;
            const price = plan.price[billingCycle];
            const isCurrentPlan = user?.plan === plan.planType;

            return (
              <Card
                key={index}
                className={`relative ${
                  plan.highlighted
                    ? 'border-2 border-blue-500 shadow-xl'
                    : 'border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <Badge variant="success">Current Plan</Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className={`w-12 h-12 rounded-lg ${plan.bgColor} flex items-center justify-center mx-auto mb-4`}>
                    <PlanIcon className={`w-6 h-6 ${plan.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-700">{plan.description}</CardDescription>

                  <div className="mt-4">
                    {price !== null ? (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-gray-900">${price}</span>
                          <span className="text-gray-700">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        </div>
                        {billingCycle === 'annual' && plan.planType !== 'free' && (
                          <p className="text-xs text-green-700 mt-1">
                            Save ${savings(plan.price.monthly, plan.price.annual).saved}/year
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="text-2xl font-bold text-gray-900">Custom</div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2 text-sm text-gray-900">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.planType === 'enterprise' ? (
                    <Link href="mailto:sales@bfsicampaigns.com">
                      <Button
                        variant={plan.highlighted ? 'default' : 'outline'}
                        className="w-full text-gray-900 border-gray-300"
                      >
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  ) : isCurrentPlan ? (
                    <Button variant="outline" className="w-full text-gray-900 border-gray-300" disabled>
                      Current Plan
                    </Button>
                  ) : isAuthenticated ? (
                    <Button
                      variant={plan.highlighted ? 'default' : 'outline'}
                      className={`w-full ${
                        plan.highlighted
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-900 border-gray-300'
                      }`}
                    >
                      Upgrade to {plan.name}
                    </Button>
                  ) : (
                    <Link href="/signup">
                      <Button
                        variant={plan.highlighted ? 'default' : 'outline'}
                        className={`w-full ${
                          plan.highlighted
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-900 border-gray-300'
                        }`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately,
                  and we'll prorate your billing accordingly.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">What happens after my free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Your free trial lasts 14 days with 3 campaigns included. After the trial, you can
                  choose to upgrade to a paid plan or continue with limited free access.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  We accept all major credit cards (Visa, MasterCard, American Express) and support
                  invoice-based billing for Enterprise customers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Is my data secure and compliant?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Absolutely. We follow industry-standard security practices and ensure all generated
                  content is checked for BFSI compliance. Your data is encrypted at rest and in transit.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
          <CardHeader className="space-y-6 py-12 text-center">
            <CardTitle className="text-3xl md:text-4xl">
              Ready to Get Started?
            </CardTitle>
            <CardDescription className="text-white text-lg">
              Start your free trial today. No credit card required.
            </CardDescription>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Start Free Trial
                  <Sparkles className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="mailto:sales@bfsicampaigns.com">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white/10">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-gray-700">
          <p>&copy; 2025 BFSI Campaign Generator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
