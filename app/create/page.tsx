'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CsvUpload } from '@/components/csv-upload';
import { ColumnPreview } from '@/components/column-preview';
import { ArrowLeft, Sparkles, MessageSquare, Loader2, AlertTriangle, Crown } from 'lucide-react';
import { CampaignFormData, CsvPreviewData, CsvRow, UsageStats } from '@/types';
import { campaignApi } from '@/lib/api';

export default function CreateCampaignPage() {
  const router = useRouter();
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const [usageStats] = useState<UsageStats>({
    userId: 'clerk-user',
    campaignsGenerated: 0,
    campaignsLimit: 3,
    rowsProcessed: 0,
    rowsLimit: 30,
    periodStart: new Date().toISOString(),
    periodEnd: new Date().toISOString(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const [formData, setFormData] = useState<CampaignFormData>({
    csv: null,
    rows: [],
    csvPreview: null,
    prompt: '',
    tone: 'professional',
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900">Loading...</div>
      </div>
    );
  }

  const handleCsvUpload = (rows: CsvRow[], file: File | null, preview: CsvPreviewData) => {
    setFormData((prev) => ({ ...prev, rows, csv: file, csvPreview: preview }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.csv || formData.rows.length === 0) {
      alert('Please upload a CSV file');
      return;
    }

    if (!formData.prompt.trim()) {
      alert('Please enter a campaign prompt');
      return;
    }

    const campaignsRemaining = usageStats.campaignsLimit - usageStats.campaignsGenerated;
    const rowsRemaining = usageStats.rowsLimit - usageStats.rowsProcessed;

    if (campaignsRemaining <= 0) {
      setLimitMessage(`You've reached your campaign limit (${usageStats.campaignsLimit} campaigns per month). Please upgrade your plan.`);
      setShowLimitDialog(true);
      return;
    }

    if (formData.rows.length > rowsRemaining) {
      setLimitMessage(`This campaign would exceed your row limit. You have ${rowsRemaining} rows remaining.`);
      setShowLimitDialog(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await campaignApi.startCampaign(formData);

      router.push(`/execution/${response.executionId}`);
    } catch (error) {
      console.error('Error starting campaign:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start campaign. Please try again.';
      alert(errorMessage);
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    !!formData.csv &&
    formData.rows.length > 0 &&
    formData.csvPreview?.hasAllRequired &&
    formData.prompt.trim();

  const campaignUsagePercent = (usageStats.campaignsGenerated / usageStats.campaignsLimit) * 100;
  const rowUsagePercent = (usageStats.rowsProcessed / usageStats.rowsLimit) * 100;
  const isNearCampaignLimit = campaignUsagePercent >= 80;
  const isNearRowLimit = rowUsagePercent >= 80;
  const displayName =
    clerkUser?.fullName ||
    clerkUser?.primaryEmailAddress?.emailAddress ||
    'User';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">{displayName}</span> • Free
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Usage Warning */}
        {(isNearCampaignLimit || isNearRowLimit) && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900 mb-1">Usage Limit Warning</p>
                <p className="text-sm text-yellow-800 mb-2">
                  {isNearCampaignLimit &&
                    `You've used ${usageStats.campaignsGenerated} of ${usageStats.campaignsLimit} campaigns this month. `}
                  {isNearRowLimit &&
                    `You've processed ${usageStats.rowsProcessed} of ${usageStats.rowsLimit} rows this month. `}
                </p>
                <Link href="/pricing">
                  <Button variant="outline" size="sm" className="text-yellow-900 border-yellow-300 bg-yellow-100 hover:bg-yellow-200">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Campaign
          </Badge>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Create New Campaign</h1>
          <p className="text-lg text-gray-700">
            Upload your customer data and configure your marketing campaign
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CSV Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                Upload Customer Data
              </CardTitle>
              <CardDescription>
                Upload a CSV file with your customer data (max 100 rows). Required columns:
                customer_id, name, phone, email, age, location, occupation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CsvUpload onUpload={handleCsvUpload} maxRows={100} />

              {/* Column Preview */}
              {formData.csvPreview && formData.csvPreview.totalRows > 0 && (
                <ColumnPreview preview={formData.csvPreview} />
              )}

              {/* Row limit warning */}
              {formData.rows.length > 0 && formData.rows.length + usageStats.rowsProcessed > usageStats.rowsLimit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ This would exceed your row limit. Please reduce rows or upgrade your plan.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                Configure Campaign
              </CardTitle>
              <CardDescription>
                Set your campaign parameters and messaging preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Prompt */}
              <div className="space-y-2">
                <Label htmlFor="prompt" className="flex items-center gap-2 text-gray-900">
                  <MessageSquare className="w-4 h-4" />
                  Campaign Prompt
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Example: Generate a personalized credit card offer highlighting cashback benefits for each customer in the CSV..."
                  value={formData.prompt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, prompt: e.target.value }))
                  }
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-600">
                  Describe what you want the AI to generate for each customer. The CSV data will be used to personalize the content.
                </p>
              </div>

              {/* Tone Selection */}
              <div className="space-y-2">
                <Label className="text-gray-900">Message Tone</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['professional', 'friendly', 'urgent'] as const).map((tone) => (
                    <Button
                      key={tone}
                      type="button"
                      variant={formData.tone === tone ? 'default' : 'outline'}
                      onClick={() => setFormData((prev) => ({ ...prev, tone }))}
                      className="capitalize"
                    >
                      {tone}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">Ready to Generate?</h3>
                  <p className="text-sm text-gray-700">
                    Review your settings and start the campaign generation
                  </p>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={!isFormValid || isSubmitting}
                  className="px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Campaign
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Limit Exceeded Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Usage Limit Reached
            </DialogTitle>
            <DialogDescription className="text-gray-700">{limitMessage}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <p className="text-sm text-blue-900 mb-3">
                  Upgrade your plan to continue creating campaigns with more capacity.
                </p>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>Current usage:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>
                      Campaigns: {usageStats.campaignsGenerated} / {usageStats.campaignsLimit}
                    </li>
                    <li>
                      Rows: {usageStats.rowsProcessed} / {usageStats.rowsLimit}
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLimitDialog(false)} className="text-gray-900 border-gray-300">
              Cancel
            </Button>
            <Link href="/pricing">
              <Button className="bg-blue-600 text-white">
                <Crown className="w-4 h-4 mr-2" />
                View Plans
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
