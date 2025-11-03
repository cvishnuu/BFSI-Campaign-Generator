import axios from 'axios';
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

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
});

/**
 * API Client for BFSI Campaign Generator
 *
 * NOTE: These functions are currently stubbed with mock responses.
 * Replace with actual API calls when backend integration is ready.
 */
export const campaignApi = {
  /**
   * Start a new campaign execution
   */
  startCampaign: async (formData: CampaignFormData): Promise<ExecutionResponse> => {
    const response = await apiClient.post(`/public/agents/${WORKFLOW_ID}/execute`, {
      input: {
        csvData: formData.rows,
        prompt: formData.prompt,
        targetAudience: formData.targetAudience,
        tone: formData.tone,
      },
      description: `BFSI Campaign: ${formData.prompt.substring(0, 50)}...`,
    });
    return response.data;
  },

  /**
   * Get execution status
   */
  getExecutionStatus: async (executionId: string): Promise<ExecutionStatusResponse> => {
    const response = await apiClient.get(`/public/executions/${executionId}/status`);
    return response.data;
  },

  /**
   * Get execution results
   */
  getExecutionResults: async (executionId: string): Promise<ExecutionResultsResponse> => {
    const response = await apiClient.get(`/public/executions/${executionId}/results`);
    return response.data;
  },

  /**
   * Get pending approval data
   */
  getPendingApproval: async (executionId: string): Promise<PendingApprovalData> => {
    const response = await apiClient.get(`/public/executions/${executionId}/pending-approval`);
    return response.data;
  },

  /**
   * Approve campaign
   */
  approveCampaign: async (executionId: string): Promise<void> => {
    await apiClient.post(`/public/executions/${executionId}/approve`, {
      comment: 'Campaign approved from BFSI UI',
    });
  },

  /**
   * Reject campaign
   */
  rejectCampaign: async (executionId: string, reason?: string): Promise<void> => {
    await apiClient.post(`/public/executions/${executionId}/reject`, {
      comment: reason || 'Campaign rejected from BFSI UI',
    });
  },
};

/**
 * WebSocket connection for real-time updates
 *
 * NOTE: This is stubbed. Implement actual WebSocket connection when ready.
 */
export class ExecutionWebSocket {
  private executionId: string;
  private onStatusUpdate?: (status: ExecutionStatusResponse) => void;
  private onLog?: (log: string) => void;

  constructor(executionId: string) {
    this.executionId = executionId;
  }

  connect() {
    // TODO: Implement WebSocket connection
    // const ws = new WebSocket(`ws://localhost:3001/executions/${this.executionId}`);
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data.type === 'status') this.onStatusUpdate?.(data);
    //   if (data.type === 'log') this.onLog?.(data.message);
    // };

    console.log('WebSocket connection (stubbed):', this.executionId);
  }

  onStatus(callback: (status: ExecutionStatusResponse) => void) {
    this.onStatusUpdate = callback;
  }

  onLogMessage(callback: (log: string) => void) {
    this.onLog = callback;
  }

  disconnect() {
    // TODO: Close WebSocket connection
    console.log('WebSocket disconnected (stubbed)');
  }
}

export default apiClient;
