export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'pending_approval';

export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
  trialEndsAt?: string;
  createdAt: string;
}

export interface UsageStats {
  userId: string;
  campaignsGenerated: number;
  campaignsLimit: number;
  rowsProcessed: number;
  rowsLimit: number;
  periodStart: string;
  periodEnd: string;
}

export interface CampaignFormData {
  csv: File | null;
  rows: any[];
  prompt: string;
  targetAudience: string;
  tone: 'professional' | 'friendly' | 'urgent';
}

export interface ExecutionResponse {
  executionId: string;
  status: ExecutionStatus;
  message: string;
}

export interface ExecutionStatusResponse {
  executionId: string;
  workflowId: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface ExecutionResultsResponse {
  executionId: string;
  status: ExecutionStatus;
  results: any;
  output: any;
}

export interface PendingApprovalData {
  executionId: string;
  workflowId: string;
  status: string;
  approvalData: {
    generatedContent: Array<{
      row: number;
      name: string;
      product: string;
      message: string;
      complianceScore: number;
      complianceStatus: string;
      violations?: string[];
    }>;
  };
  startedAt: string;
}
