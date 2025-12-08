import axios, { AxiosRequestConfig } from 'axios';

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:4000';

interface UsageResponse {
  usage: {
    campaignsGenerated: number;
    rowsProcessed: number;
    periodStart: string;
    periodEnd: string;
  };
}

interface UserResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    plan: string;
    created_at: string;
    updated_at: string;
  };
}

/**
 * BFF API Client
 * Communicates with the BFF backend for user management and usage tracking
 */
export const bffApi = {
  /**
   * Get current user's usage statistics
   * @param token - Clerk auth token
   */
  getUsage: async (token: string): Promise<UsageResponse> => {
    const response = await axios.get(`${BFF_URL}/api/v1/usage`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  /**
   * Get current user information
   * @param token - Clerk auth token
   */
  getMe: async (token: string): Promise<UserResponse> => {
    const response = await axios.get(`${BFF_URL}/api/v1/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  /**
   * Validate campaign and track usage (NEW FLOW)
   * Call this BEFORE calling workflow API
   * @param data - Campaign data (CSV rows, prompt, tone)
   * @param token - Clerk auth token
   * @returns Success status and validation result
   */
  validateAndTrackCampaign: async (
    data: {
      csvData: any[];
      prompt: string;
      tone: string;
    },
    token: string
  ): Promise<{
    success: boolean;
    message: string;
    rowCount: number;
  }> => {
    const response = await axios.post(
      `${BFF_URL}/api/v1/campaigns/validate-and-track`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  /**
   * Start a campaign execution (DEPRECATED - use validateAndTrackCampaign + campaignApi.startCampaign)
   * @param data - Campaign data (CSV rows, prompt, tone)
   * @param token - Clerk auth token
   */
  startCampaign: async (
    data: {
      csvData: any[];
      prompt: string;
      tone: string;
    },
    token: string
  ): Promise<{
    executionId: string;
    status: string;
    message: string;
  }> => {
    const response = await axios.post(
      `${BFF_URL}/api/v1/campaigns/execute`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  /**
   * Get campaign execution status
   * @param executionId - Execution ID
   * @param token - Clerk auth token
   */
  getCampaignStatus: async (
    executionId: string,
    token: string
  ): Promise<any> => {
    const response = await axios.get(
      `${BFF_URL}/api/v1/campaigns/${executionId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  /**
   * Get campaign execution results
   * @param executionId - Execution ID
   * @param token - Clerk auth token
   */
  getCampaignResults: async (
    executionId: string,
    token: string
  ): Promise<any> => {
    const response = await axios.get(
      `${BFF_URL}/api/v1/campaigns/${executionId}/results`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  /**
   * Get pending approval data
   * @param executionId - Execution ID
   * @param token - Clerk auth token
   */
  getPendingApproval: async (
    executionId: string,
    token: string
  ): Promise<any> => {
    const response = await axios.get(
      `${BFF_URL}/api/v1/campaigns/${executionId}/pending-approval`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  /**
   * Approve a campaign
   * @param executionId - Execution ID
   * @param token - Clerk auth token
   */
  approveCampaign: async (
    executionId: string,
    token: string
  ): Promise<void> => {
    await axios.post(
      `${BFF_URL}/api/v1/campaigns/${executionId}/approve`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * Reject a campaign
   * @param executionId - Execution ID
   * @param token - Clerk auth token
   */
  rejectCampaign: async (
    executionId: string,
    token: string
  ): Promise<void> => {
    await axios.post(
      `${BFF_URL}/api/v1/campaigns/${executionId}/reject`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },
};
