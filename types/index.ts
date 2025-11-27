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

export interface CsvRow {
  customerId: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  city: string;
  country: string;
  occupation: string;
  [key: string]: string | number | boolean | null | undefined; // Allow additional custom columns
}

export interface CsvPreviewData {
  columns: string[];
  sampleRows: CsvRow[];
  totalRows: number;
  missingColumns: string[];
  hasAllRequired: boolean;
}

export interface CampaignFormData {
  csv: File | null;
  rows: CsvRow[];
  csvPreview: CsvPreviewData | null;
  prompt: string;
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
  results: {
    generatedContent?: GeneratedContentRow[];
  } | null;
  output: Record<string, unknown>;
}

// XAI (Explainable AI) Types
export interface XaiFeatureContribution {
  feature: string;
  weight: number;
  impact: string;
}

export interface XaiMetadata {
  reasoningTrace?: string[];
  decisionFactors?: string[];
  confidence?: number; // 0-1
  featureContributions?: XaiFeatureContribution[];
  scoreBreakdown?: {
    calculation?: string; // Human-readable formula, e.g., "2 MEDIUM (15×2) = 30 total risk"
    violationsBySeverity?: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  };
}

export interface ComplianceRuleHit {
  rule: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  evidence: string;
}

export interface ComplianceEvidence {
  sourceId?: string;
  text: string;
}

export interface ComplianceXaiMetadata extends XaiMetadata {
  ruleHits?: ComplianceRuleHit[];
  evidence?: ComplianceEvidence[];
  xaiError?: string;
}

export interface GeneratedContentRow {
  row: number;
  name: string;
  product: string;
  message: string;
  complianceScore: number;
  complianceStatus: string;
  violations?: string[];
  xai?: XaiMetadata; // Message generation XAI
  compliance_xai?: ComplianceXaiMetadata; // Compliance check XAI
}

export interface PendingApprovalData {
  executionId: string;
  workflowId: string;
  status: string;
  approvalData: {
    generatedContent: GeneratedContentRow[];
  };
  startedAt: string;
}
