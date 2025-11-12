'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import {
  Sparkles,
  Upload,
  Target,
  CheckCircle,
  Download,
  Shield,
  Zap,
  BarChart
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Upload,
      title: 'Easy CSV Upload',
      description: 'Upload your customer data in CSV format with up to 100 rows at once',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Generate personalized marketing messages using advanced AI technology',
    },
    {
      icon: Shield,
      title: 'Compliance First',
      description: 'Automatic compliance checking for BFSI regulations and guidelines',
    },
    {
      icon: Target,
      title: 'Targeted Messaging',
      description: 'Customize tone and audience targeting for maximum engagement',
    },
    {
      icon: CheckCircle,
      title: 'Review & Approve',
      description: 'Review all generated content before finalizing your campaign',
    },
    {
      icon: Download,
      title: 'Export Results',
      description: 'Download your approved campaigns as CSV or Excel files',
    },
  ];

  const stats = [
    { label: 'Campaigns Generated', value: '10,000+' },
    { label: 'Compliance Rate', value: '99.8%' },
    { label: 'Time Saved', value: '85%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">BFSI Campaign Generator</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/contact">
              <Button variant="ghost" className="text-gray-900 font-semibold">Contact Us</Button>
            </Link>
            <SignedOut>
              <Link href="/login">
                <Button variant="outline" className="text-gray-900 font-semibold border-gray-300">Login</Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" className="bg-blue-600 text-white font-semibold">Sign Up Free</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="outline" className="text-gray-900 font-semibold border-gray-300">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-6" variant="secondary">
          <Sparkles className="w-3 h-3 mr-1" />
          Powered by AI
        </Badge>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Create Compliant Marketing
          <br />
          Campaigns in Minutes
        </h1>

        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Generate personalized, compliance-checked marketing messages for your BFSI customers
          using AI. Upload your data, customize your message, and download ready-to-use campaigns.
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link href="/create">
            <Button size="lg" className="text-lg px-8 bg-blue-600 text-white font-semibold">
              <Sparkles className="w-5 h-5 mr-2" />
              Create Campaign
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8 text-gray-900 font-semibold border-gray-300 hover:bg-gray-50">
            <BarChart className="w-5 h-5 mr-2" />
            View Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-sm text-gray-700 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Everything You Need for
            <span className="text-blue-600"> Compliant Marketing</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Our platform handles the entire workflow from data upload to campaign delivery
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 bg-gray-50 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Simple 4-Step Process
          </h2>
          <p className="text-lg text-gray-700">
            From data to campaign in just a few clicks
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { step: '1', title: 'Upload CSV', description: 'Upload your customer data file' },
            { step: '2', title: 'Configure', description: 'Set campaign parameters and tone' },
            { step: '3', title: 'Review', description: 'Review and approve generated content' },
            { step: '4', title: 'Download', description: 'Export your campaign results' },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-700">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
          <CardHeader className="space-y-6 py-12">
            <CardTitle className="text-3xl md:text-4xl">
              Ready to Transform Your Marketing?
            </CardTitle>
            <CardDescription className="text-white text-lg">
              Join thousands of financial institutions using AI-powered campaign generation
            </CardDescription>
            <div>
              <Link href="/create">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Get Started Now
                  <Sparkles className="w-5 h-5 ml-2" />
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
