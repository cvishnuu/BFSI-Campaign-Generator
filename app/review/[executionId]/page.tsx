'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Eye,
  Shield,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { campaignApi } from '@/lib/api';

interface GeneratedContent {
  row: number;
  name: string;
  product?: string;
  message: string;
  complianceScore: number;
  complianceStatus: 'pass' | 'warning' | 'fail';
  violations?: string[];
}
type ApprovalRow = {
  row: number;
  name?: string;
  message?: string;
  complianceScore?: number;
  complianceStatus?: string;
  violations?: string[];
};

export default function ReviewApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const executionId = params.executionId as string;

  const [isApproving, setIsApproving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch approval data from API
  useEffect(() => {
    const fetchApprovalData = async () => {
      try {
        setIsLoading(true);
        const approvalData = await campaignApi.getPendingApproval(executionId);

        console.log('Received approval data:', approvalData);

        // Transform the approval data to match our interface
        // Backend returns: approvalData.generatedContent[] with message, complianceScore, etc.
        const rows = (approvalData.approvalData?.generatedContent || []) as ApprovalRow[];

        const transformedContent: GeneratedContent[] = rows.map((row) => ({
          row: row.row,
          name: row.name || 'Unknown',
          message: row.message || '',
          complianceScore: row.complianceScore || 0,
          complianceStatus:
            row.complianceStatus === 'pass'
              ? 'pass'
              : row.complianceStatus === 'fail'
                ? 'fail'
                : 'warning',
          violations: row.violations || [],
        }));

        console.log('Transformed content:', transformedContent);
        setGeneratedContent(transformedContent);
      } catch (err) {
        console.error('Error fetching approval data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load approval data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovalData();
  }, [executionId]);

  const stats = {
    total: generatedContent.length,
    passed: generatedContent.filter((c) => c.complianceStatus === 'pass').length,
    warnings: generatedContent.filter((c) => c.complianceStatus === 'warning').length,
    failed: generatedContent.filter((c) => c.complianceStatus === 'fail').length,
    avgScore:
      generatedContent.reduce((sum, c) => sum + c.complianceScore, 0) /
      generatedContent.length,
  };

  const handleApprove = async () => {
    setIsApproving(true);

    try {
      // Call real API to approve campaign
      await campaignApi.approveCampaign(executionId);

      // Navigate to results page
      router.push(`/results/${executionId}`);
    } catch (error) {
      console.error('Error approving campaign:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve campaign. Please try again.';
      alert(errorMessage);
      setIsApproving(false);
    }
  };

  const getComplianceBadge = (status: string, score: number) => {
    switch (status) {
      case 'pass':
        return (
          <Badge variant="success">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Pass ({score}%)
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="warning">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning ({score}%)
          </Badge>
        );
      case 'fail':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Fail ({score}%)
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-900">Loading approval data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Review & Approve Campaign</h1>
          <p className="text-lg text-gray-700">
            Review generated content and compliance scores before finalizing
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Messages</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Passed</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.passed}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Warnings</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats.warnings}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Failed</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.failed}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Score</CardDescription>
              <CardTitle className="text-3xl">{stats.avgScore.toFixed(1)}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Content Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>
                  Review each message and its compliance status
                </CardDescription>
              </div>
              <Button onClick={handleApprove} disabled={isApproving} size="lg">
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Campaign
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Row</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedContent.map((content) => (
                  <TableRow key={content.row}>
                    <TableCell className="font-medium">{content.row}</TableCell>
                    <TableCell>{content.name}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="truncate text-sm">{content.message}</p>
                    </TableCell>
                    <TableCell>
                      {getComplianceBadge(content.complianceStatus, content.complianceScore)}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Message Details - Row {content.row}</DialogTitle>
                            <DialogDescription>
                              Review the complete message and compliance details
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-semibold">Customer</Label>
                              <p className="text-sm mt-1 text-gray-900">{content.name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-semibold">Generated Message</Label>
                              <p className="text-sm mt-1 p-3 bg-gray-50 rounded border text-gray-900">
                                {content.message}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-semibold flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Compliance Analysis
                              </Label>
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <span className="text-sm text-gray-900">Score</span>
                                  {getComplianceBadge(
                                    content.complianceStatus,
                                    content.complianceScore
                                  )}
                                </div>
                                {content.violations && content.violations.length > 0 && (
                                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-sm font-semibold text-yellow-900 mb-2">
                                      Compliance Warnings:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                      {content.violations.map((violation, idx) => (
                                        <li key={idx} className="text-sm text-yellow-800">
                                          {violation}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Action Card */}
        <Card className="mt-8 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">Ready to Finalize?</h3>
                <p className="text-sm text-gray-700">
                  Approve this campaign to download the results
                </p>
              </div>
              <Button onClick={handleApprove} disabled={isApproving} size="lg">
                {isApproving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Approve & Continue
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`${className} text-gray-900`}>{children}</label>;
}
