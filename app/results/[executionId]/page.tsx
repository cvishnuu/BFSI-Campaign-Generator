'use client';

import { useState } from 'react';
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
  Download,
  FileText,
  CheckCircle2,
  Sparkles,
  Home,
  Plus,
  Share2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface CampaignResult {
  row: number;
  name: string;
  product: string;
  message: string;
  complianceScore: number;
  complianceStatus: string;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const executionId = params.executionId as string;

  const [isDownloading, setIsDownloading] = useState(false);

  // Mock campaign results (will be replaced with actual API call)
  const campaignResults: CampaignResult[] = [
    {
      row: 1,
      name: 'John Smith',
      product: 'Premium Credit Card',
      message:
        'Dear John, discover exclusive cashback benefits with our Premium Credit Card. Earn up to 5% on all purchases!',
      complianceScore: 98,
      complianceStatus: 'pass',
    },
    {
      row: 2,
      name: 'Sarah Johnson',
      product: 'Investment Portfolio',
      message:
        'Hi Sarah, our curated Investment Portfolio offers balanced growth opportunities tailored to your financial goals.',
      complianceScore: 92,
      complianceStatus: 'pass',
    },
    {
      row: 3,
      name: 'Michael Chen',
      product: 'Auto Loan',
      message:
        'Hello Michael, get pre-approved for an Auto Loan with competitive rates starting at 3.99% APR.',
      complianceScore: 75,
      complianceStatus: 'warning',
    },
    {
      row: 4,
      name: 'Emily Davis',
      product: 'Home Mortgage',
      message:
        'Dear Emily, make your dream home a reality with our flexible Home Mortgage options and expert guidance.',
      complianceScore: 95,
      complianceStatus: 'pass',
    },
    {
      row: 5,
      name: 'Robert Wilson',
      product: 'Personal Loan',
      message:
        'Hi Robert, need quick funds? Our Personal Loan offers instant approval with amounts up to $50,000.',
      complianceScore: 88,
      complianceStatus: 'pass',
    },
  ];

  const campaignSummary = {
    executionId,
    totalMessages: campaignResults.length,
    approvedAt: new Date().toLocaleString(),
    avgComplianceScore:
      campaignResults.reduce((sum, r) => sum + r.complianceScore, 0) /
      campaignResults.length,
  };

  const handleDownloadCSV = () => {
    setIsDownloading(true);

    try {
      // Create CSV content
      const headers = ['Row', 'Name', 'Product', 'Message', 'Compliance Score', 'Status'];
      const rows = campaignResults.map((result) => [
        result.row,
        result.name,
        result.product,
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
        ['Row', 'Name', 'Product', 'Message', 'Compliance Score', 'Status'],
        ...campaignResults.map((result) => [
          result.row,
          result.name,
          result.product,
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
        { wch: 25 },
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
          <h1 className="text-4xl font-bold mb-2">Campaign Complete!</h1>
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
                  <TableHead>Product</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-[120px]">Compliance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignResults.map((result) => (
                  <TableRow key={result.row}>
                    <TableCell className="font-medium">{result.row}</TableCell>
                    <TableCell>{result.name}</TableCell>
                    <TableCell className="text-sm">{result.product}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm">{result.message}</p>
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
