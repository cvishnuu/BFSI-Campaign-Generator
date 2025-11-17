'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  MessageSquare,
  Shield,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ExecutionStatus } from '@/types';
import { campaignApi } from '@/lib/api';

interface ExecutionStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  icon: LucideIcon;
  description: string;
}

export default function ExecutionTrackerPage() {
  const params = useParams();
  const router = useRouter();
  const executionId = params.executionId as string;

  const [status, setStatus] = useState<ExecutionStatus>('running');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const steps: ExecutionStep[] = [
    {
      id: 'parse',
      name: 'Parsing Data',
      status: 'completed',
      icon: FileText,
      description: 'Processing uploaded customer data',
    },
    {
      id: 'generate',
      name: 'Generating Content',
      status: 'running',
      icon: MessageSquare,
      description: 'Creating personalized messages using AI',
    },
    {
      id: 'compliance',
      name: 'Compliance Check',
      status: 'pending',
      icon: Shield,
      description: 'Verifying BFSI regulations compliance',
    },
    {
      id: 'complete',
      name: 'Finalization',
      status: 'pending',
      icon: Sparkles,
      description: 'Preparing results for review',
    },
  ];

  // Poll execution status from API
  useEffect(() => {
    let isMounted = true;
    let pollCount = 0;
    const MAX_POLLS = 120; // 10 minutes max (5 seconds * 120 = 600s)

    const pollStatus = async () => {
      if (!isMounted || pollCount >= MAX_POLLS) return;

      try {
        const statusData = await campaignApi.getExecutionStatus(executionId);

        if (!isMounted) return;

        // Update status
        setStatus(statusData.status as ExecutionStatus);

        // Estimate progress based on status
        if (statusData.status === 'pending') {
          setProgress(10);
          setCurrentStep(0);
        } else if (statusData.status === 'running') {
          // Gradually increase progress
          setProgress((prev) => {
            const next = Math.min(prev + 5, 85);
            setCurrentStep(Math.min(Math.floor(next / 30), 2));
            return next;
          });
        } else if (statusData.status === 'pending_approval') {
          setProgress(90);
          setCurrentStep(2);
        } else if (statusData.status === 'completed') {
          setProgress(100);
          setCurrentStep(3);
        } else if (statusData.status === 'failed') {
          setProgress(100);
          setStatus('failed');
        }

        // Add log entry
        const timestamp = new Date().toLocaleTimeString();
        if (statusData.status === 'running') {
          setLogs((prev) => [...prev, `[${timestamp}] Workflow executing...`]);
        }

        pollCount++;

        // Continue polling if not in terminal state
        if (statusData.status === 'pending' || statusData.status === 'running') {
          setTimeout(pollStatus, 3000); // Poll every 3 seconds
        } else if (statusData.status === 'pending_approval' || statusData.status === 'completed') {
          // Navigate after brief delay
          if (statusData.status === 'pending_approval' || statusData.status === 'completed') {
            setTimeout(() => {
              if (isMounted) {
                router.push(`/review/${executionId}`);
              }
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error polling execution status:', error);
        if (isMounted) {
          setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
          setStatus('failed');
        }
      }
    };

    // Start polling
    pollStatus();

    return () => {
      isMounted = false;
    };
  }, [executionId, router]);

  // Navigation handled in polling logic above

  const getStepStatus = (index: number): ExecutionStep['status'] => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'running';
    return 'pending';
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Running
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="success">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          {getStatusBadge()}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Campaign Execution</h1>
          <p className="text-lg text-gray-700">
            Execution ID: <span className="font-mono">{executionId}</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left side - Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
                <CardDescription>
                  {status === 'completed'
                    ? 'Campaign generation completed successfully'
                    : 'Your campaign is being generated...'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Overall Progress</span>
                    <span className="text-sm font-medium text-gray-900">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                {status === 'completed' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">
                          Campaign Generated Successfully!
                        </p>
                        <p className="text-sm text-green-700">
                          Redirecting to review page...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Execution Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Execution Steps</CardTitle>
                <CardDescription>Track the progress of each step</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {steps.map((step, index) => {
                  const stepStatus = getStepStatus(index);
                  const StepIcon = step.icon;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                        stepStatus === 'running'
                          ? 'border-blue-300 bg-blue-50'
                          : stepStatus === 'completed'
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          stepStatus === 'running'
                            ? 'bg-blue-600'
                            : stepStatus === 'completed'
                            ? 'bg-green-600'
                            : 'bg-gray-400'
                        }`}
                      >
                        {stepStatus === 'running' ? (
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : stepStatus === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                          <StepIcon className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 text-gray-900">{step.name}</h3>
                        <p className="text-sm text-gray-700">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right side - Logs */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Execution Logs</CardTitle>
                <CardDescription>Real-time activity feed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-sm text-gray-700 text-center py-4">
                      Waiting for logs...
                    </p>
                  ) : (
                    logs.map((log, index) => (
                      <div
                        key={index}
                        className="text-xs font-mono p-2 bg-gray-100 rounded border border-gray-200 text-gray-900"
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
