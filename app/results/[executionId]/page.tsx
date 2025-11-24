'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle2,
  Sparkles,
  Home,
  Plus,
  Loader2,
  XCircle,
  MessageCircle,
  Mail,
  Send,
  Eye,
  Brain,
  Shield,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { campaignApi } from '@/lib/api';
import { XaiReasoningPanel, ComplianceXaiPanel } from '@/components/xai';
import { XaiMetadata, ComplianceXaiMetadata } from '@/types';

interface CampaignResult {
  row: number;
  name: string;
  message: string;
  complianceScore: number;
  complianceStatus: string;
  violations?: string[];
  xai?: XaiMetadata;
  compliance_xai?: ComplianceXaiMetadata;
}
interface RawResultRow {
  row?: number;
  name?: string;
  customer_name?: string;
  generated_content?: string;
  message?: string;
  compliance_risk_score?: number;
  complianceScore?: number;
  compliance_status?: string;
  compliance_flagged_terms?: string[];
  violations?: string[];
  xai?: XaiMetadata;
  compliance_xai?: ComplianceXaiMetadata;
  [key: string]: unknown;
}

export default function ResultsPage() {
  const params = useParams();
  const executionId = params.executionId as string;

  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaignResults, setCampaignResults] = useState<CampaignResult[]>([]);
  const [loadingMessage, setLoadingMessage] = useState('Checking execution status...');

  // Fetch real campaign results from API with polling
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    const pollExecutionStatus = async () => {
      try {
        setLoadingMessage('Checking execution status...');
        const statusResponse = await campaignApi.getExecutionStatus(executionId);

        console.log('Execution status:', statusResponse.status);

        // If still running or pending approval, keep polling
        if (statusResponse.status === 'running' || statusResponse.status === 'pending' || statusResponse.status === 'pending_approval') {
          setLoadingMessage(`Campaign is ${statusResponse.status}... Please wait`);
          return false; // Not ready yet
        }

        // If failed, show error
        if (statusResponse.status === 'failed') {
          // Even if failed, try to fetch results (they might be partial)
          setLoadingMessage('Execution failed, attempting to fetch partial results...');
        }

        // If completed or failed, fetch results
        return true; // Ready to fetch results
      } catch (err) {
        console.error('Error polling status:', err);
        return true; // Try to fetch results anyway
      }
    };

    const fetchResults = async () => {
      try {
        setIsLoading(true);

        // First, poll until execution is complete
        const isReady = await pollExecutionStatus();

        if (!isReady) {
          // Set up polling interval
          pollInterval = setInterval(async () => {
            const ready = await pollExecutionStatus();
            if (ready) {
              if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
              }
              await loadResults();
            }
          }, 3000); // Poll every 3 seconds
          return;
        }

        // If already ready, load results immediately
        await loadResults();
      } catch (err) {
        console.error('Error in fetchResults:', err);
        setError(err instanceof Error ? err.message : 'Failed to load campaign results');
        setIsLoading(false);
      }
    };

    const loadResults = async () => {
      try {
        setLoadingMessage('Loading campaign results...');
        const response = await campaignApi.getExecutionResults(executionId);

        console.log('Received execution results:', response);

        // Extract results from the API response
        // After approval, data can be in multiple locations:
        // 1. response.output.rows[] (from workflow output)
        // 2. response.output.approvalData.approvalData.rows[] (from manual approval node)
        // 3. response.output.approvalData.rows[] (alternative structure)
          let rows: RawResultRow[] = Array.isArray(response.output?.rows)
            ? (response.output.rows as RawResultRow[])
            : [];

        // If rows is empty, check approvalData structure
            if (!rows || rows.length === 0) {
              const approvalData = response.output?.approvalData as
                | { approvalData?: { rows?: RawResultRow[] }; rows?: RawResultRow[] }
                | undefined;
              if (approvalData?.approvalData?.rows) {
                rows = approvalData.approvalData.rows;
              } else if (approvalData?.rows) {
                rows = approvalData.rows;
              }
            }

        console.log('Extracted rows:', rows);

        const transformedResults: CampaignResult[] = rows.map((item, index) => ({
          row: item.row ?? index + 1,
          name: item.name || item.customer_name || 'Unknown',
          message: item.generated_content || item.message || '',
          complianceScore: 100 - (Number(item.compliance_risk_score) || Number(item.complianceScore) || 0),
          complianceStatus:
            item.compliance_status === 'passed' || item.compliance_status === 'pass'
              ? 'pass'
              : item.compliance_status === 'failed' || item.compliance_status === 'fail'
                ? 'fail'
                : 'warning',
          violations: item.compliance_flagged_terms || item.violations || [],
          xai: item.xai,
          compliance_xai: item.compliance_xai,
        }));

        console.log('Transformed results:', transformedResults);
        setCampaignResults(transformedResults);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load campaign results');
        setIsLoading(false);
      }
    };

    fetchResults();

    // Cleanup polling on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [executionId]);

  const campaignSummary = {
    executionId,
    totalMessages: campaignResults.length,
    approvedAt: new Date().toLocaleString(),
    avgComplianceScore:
      campaignResults.length > 0
        ? campaignResults.reduce((sum, r) => sum + r.complianceScore, 0) / campaignResults.length
        : 0,
  };

  const handleDownloadCSV = () => {
    setIsDownloading(true);

    try {
      // Create CSV content
      const headers = ['Row', 'Name', 'Message', 'Compliance Score', 'Status'];
      const rows = campaignResults.map((result) => [
        result.row,
        result.name,
        result.message,
        result.complianceScore,
        result.complianceStatus,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `campaign_${executionId}_${Date.now()}.csv`;
      link.click();
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadExcel = () => {
    setIsDownloading(true);

    try {
      // Create worksheet data
      const worksheetData = [
        ['Row', 'Name', 'Message', 'Compliance Score', 'Status'],
        ...campaignResults.map((result) => [
          result.row,
          result.name,
          result.message,
          result.complianceScore,
          result.complianceStatus,
        ]),
      ];

      // Create workbook
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Campaign Results');

      // Set column widths
      worksheet['!cols'] = [
        { wch: 5 },
        { wch: 20 },
        { wch: 60 },
        { wch: 15 },
        { wch: 10 },
      ];

      // Download file
      XLSX.writeFile(workbook, `campaign_${executionId}_${Date.now()}.xlsx`);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Failed to download Excel file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-900 mb-2">{loadingMessage}</p>
          <p className="text-sm text-gray-600">This may take a few moments...</p>
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
              Error Loading Results
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
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Campaign Complete!</h1>
          <p className="text-lg text-gray-700">
            Your campaign has been successfully generated and approved
          </p>
        </div>

        {/* Campaign Summary */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Execution ID</CardDescription>
              <CardTitle className="text-lg font-mono truncate">
                {executionId.substring(0, 12)}...
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Messages</CardDescription>
              <CardTitle className="text-3xl">{campaignSummary.totalMessages}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Compliance</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {campaignSummary.avgComplianceScore.toFixed(1)}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Approved At</CardDescription>
              <CardTitle className="text-sm">{campaignSummary.approvedAt}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Download Section */}
        <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Campaign Results
            </CardTitle>
            <CardDescription>
              Export your campaign data in CSV or Excel format
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              onClick={handleDownloadCSV}
              disabled={isDownloading}
              size="lg"
              variant="default"
            >
              <FileText className="w-5 h-5 mr-2" />
              Download CSV
            </Button>
            <Button
              onClick={handleDownloadExcel}
              disabled={isDownloading}
              size="lg"
              variant="outline"
            >
              <FileText className="w-5 h-5 mr-2" />
              Download Excel
            </Button>
          </CardContent>
        </Card>

        {/* Send Campaign Teaser */}
        <Card className="mb-8 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Send className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-lg text-gray-900">Ready to Send Your Campaign?</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  Want to distribute these messages via WhatsApp, Email, or SMS? Contact us to set up automated delivery for your campaigns.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="bg-white">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    WhatsApp
                  </Badge>
                  <Badge variant="secondary" className="bg-white">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Badge>
                  <Badge variant="secondary" className="bg-white">
                    <Send className="w-3 h-3 mr-1" />
                    SMS
                  </Badge>
                </div>
              </div>
              <div className="ml-6">
                <Link href="/contact">
                  <Button size="lg" className="bg-purple-600 text-white">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Results Preview</CardTitle>
            <CardDescription>
              Review your approved campaign messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Row</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-[120px]">Compliance</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignResults.map((result) => (
                  <TableRow key={result.row}>
                    <TableCell className="font-medium">{result.row}</TableCell>
                    <TableCell>{result.name}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm truncate">{result.message}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          result.complianceStatus === 'pass'
                            ? 'success'
                            : result.complianceStatus === 'warning'
                            ? 'warning'
                            : 'destructive'
                        }
                      >
                        {result.complianceScore}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Message Details - Row {result.row}</DialogTitle>
                            <DialogDescription>
                              Review message, compliance, and AI explainability
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <span className="text-sm font-semibold text-gray-900">Customer</span>
                              <p className="text-sm mt-1 text-gray-700">{result.name}</p>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-900">Message</span>
                              <p className="text-sm mt-1 p-3 bg-gray-50 rounded border text-gray-900">
                                {result.message}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-900">Compliance Score</span>
                              <div className="mt-2">
                                <Badge
                                  variant={
                                    result.complianceStatus === 'pass'
                                      ? 'success'
                                      : result.complianceStatus === 'warning'
                                      ? 'warning'
                                      : 'destructive'
                                  }
                                >
                                  {result.complianceScore}%
                                </Badge>
                              </div>
                            </div>

                            {/* XAI Tabs */}
                            <Tabs defaultValue="content" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="content" className="flex items-center gap-2">
                                  <Brain className="w-4 h-4" />
                                  Content Analysis
                                </TabsTrigger>
                                <TabsTrigger value="compliance" className="flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  Compliance Check
                                </TabsTrigger>
                              </TabsList>
                              <TabsContent value="content" className="mt-4">
                                <XaiReasoningPanel xai={result.xai} />
                              </TabsContent>
                              <TabsContent value="compliance" className="mt-4">
                                <ComplianceXaiPanel complianceXai={result.compliance_xai} />
                              </TabsContent>
                            </Tabs>
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

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/create">
            <Button size="lg" variant="default">
              <Plus className="w-5 h-5 mr-2" />
              Create New Campaign
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline">
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Success Footer */}
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  Campaign Ready for Distribution
                </h3>
                <p className="text-sm text-green-700">
                  Your personalized, compliance-checked marketing messages are ready to be sent
                  to customers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
