import axios, { AxiosRequestConfig } from 'axios';
import {
  ExecutionResponse,
  ExecutionStatusResponse,
  ExecutionResultsResponse,
  PendingApprovalData,
  CampaignFormData,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'your-api-key-here';
const WORKFLOW_ID = process.env.NEXT_PUBLIC_WORKFLOW_ID || 'workflow_bfsi_marketing_template';

const baseConfig: AxiosRequestConfig = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
};

const withAuth = (token?: string | null): AxiosRequestConfig => ({
  ...baseConfig,
  headers: {
    ...baseConfig.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});

export const campaignApi = {
  startCampaign: async (formData: CampaignFormData, token?: string | null): Promise<ExecutionResponse> => {
    const response = await axios.post(
      `/public/agents/${WORKFLOW_ID}/execute`,
      {
        input: {
          csvData: formData.rows,
          prompt: formData.prompt,
          tone: formData.tone,
        },
        description: `BFSI Campaign: ${formData.prompt.substring(0, 50)}...`,
      },
      withAuth(token)
    );
    return response.data;
  },

  getExecutionStatus: async (executionId: string, token?: string | null): Promise<ExecutionStatusResponse> => {
    const response = await axios.get(`/public/executions/${executionId}/status`, withAuth(token));
    return response.data;
  },

  getExecutionResults: async (executionId: string, token?: string | null): Promise<ExecutionResultsResponse> => {
    const response = await axios.get(`/public/executions/${executionId}/results`, withAuth(token));
    return response.data;
  },

  getPendingApproval: async (executionId: string, token?: string | null): Promise<PendingApprovalData> => {
    const response = await axios.get(`/public/executions/${executionId}/pending-approval`, withAuth(token));
    return response.data;
  },

  approveCampaign: async (executionId: string, token?: string | null): Promise<void> => {
    await axios.post(
      `/public/executions/${executionId}/approve`,
      { comment: 'Campaign approved from BFSI UI' },
      withAuth(token)
    );
  },

  rejectCampaign: async (executionId: string, reason?: string, token?: string | null): Promise<void> => {
    await axios.post(
      `/public/executions/${executionId}/reject`,
      { comment: reason || 'Campaign rejected from BFSI UI' },
      withAuth(token)
    );
  },

  rejectMessage: async (
    executionId: string,
    rowId: number,
    rejectReason: string,
    token?: string | null
  ): Promise<{ success: boolean; message: string; updatedRow: any }> => {
    const response = await axios.post(
      `/public/executions/${executionId}/messages/${rowId}/reject`,
      { rejectReason },
      withAuth(token)
    );
    return response.data;
  },

  updateMessage: async (
    executionId: string,
    rowId: number,
    updatedMessage: string,
    recheckCompliance: boolean = true,
    token?: string | null
  ): Promise<{ success: boolean; message: string; updatedRow: any }> => {
    const response = await axios.patch(
      `/public/executions/${executionId}/messages/${rowId}`,
      { updatedMessage, recheckCompliance },
      withAuth(token)
    );
    return response.data;
  },
};

export default axios.create(baseConfig);
