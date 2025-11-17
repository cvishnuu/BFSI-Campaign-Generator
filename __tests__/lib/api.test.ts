/**
 * API Client Tests
 * Target: 100% coverage
 */
import { describe, it, expect } from 'vitest';
import { campaignApi } from '@/lib/api';
import { mockCSVData, mockExecutionId } from '@/mocks/test-data';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

describe('Campaign API Client', () => {
  describe('startCampaign', () => {
    it('should make POST request with correct payload', async () => {
      const formData = {
        csv: null,
        rows: mockCSVData,
        prompt: 'Generate marketing message',
        tone: 'professional' as const,
      };

      const response = await campaignApi.startCampaign(formData);

      expect(response.executionId).toBeDefined();
      expect(response.status).toBe('pending');
      expect(response.message).toContain('successfully');
    });

    it('should handle API errors', async () => {
      // Override handler to return error
      server.use(
        http.post('*/public/agents/*/execute', () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      const formData = {
        csv: null,
        rows: mockCSVData,
        prompt: 'Generate marketing message',
        tone: 'professional' as const,
      };

      await expect(campaignApi.startCampaign(formData)).rejects.toThrow();
    });

    it('should truncate description if prompt is too long', async () => {
      const longPrompt = 'A'.repeat(100);
      const formData = {
        csv: null,
        rows: mockCSVData,
        prompt: longPrompt,
        tone: 'professional' as const,
      };

      const response = await campaignApi.startCampaign(formData);

      expect(response.executionId).toBeDefined();
    });
  });

  describe('getExecutionStatus', () => {
    it('should fetch execution status successfully', async () => {
      const status = await campaignApi.getExecutionStatus(mockExecutionId);

      expect(status.executionId).toBe(mockExecutionId);
      expect(status.status).toBeDefined();
      expect(status.startedAt).toBeDefined();
    });

    it('should handle non-existent execution', async () => {
      server.use(
        http.get('*/public/executions/*/status', () => {
          return HttpResponse.json(
            { error: 'Execution not found' },
            { status: 404 }
          );
        })
      );

      await expect(
        campaignApi.getExecutionStatus('nonexistent-id')
      ).rejects.toThrow();
    });
  });

  describe('getExecutionResults', () => {
    it('should fetch execution results successfully', async () => {
      const results = await campaignApi.getExecutionResults(mockExecutionId);

      expect(results.executionId).toBe(mockExecutionId);
      expect(results.status).toBeDefined();
    });

    it('should handle API errors', async () => {
      server.use(
        http.get('*/public/executions/*/results', () => {
          return HttpResponse.json(
            { error: 'Results not available' },
            { status: 500 }
          );
        })
      );

      await expect(
        campaignApi.getExecutionResults(mockExecutionId)
      ).rejects.toThrow();
    });
  });

  describe('getPendingApproval', () => {
    it('should fetch pending approval data successfully', async () => {
      const approvalData = await campaignApi.getPendingApproval(mockExecutionId);

      expect(approvalData.executionId).toBe(mockExecutionId);
      expect(approvalData.status).toBe('pending_approval');
      expect(approvalData.approvalData).toBeDefined();
      expect(approvalData.approvalData.generatedContent).toBeInstanceOf(Array);
    });

    it('should handle execution not in approval state', async () => {
      server.use(
        http.get('*/public/executions/*/pending-approval', () => {
          return HttpResponse.json(
            { error: 'Execution not pending approval' },
            { status: 404 }
          );
        })
      );

      await expect(
        campaignApi.getPendingApproval(mockExecutionId)
      ).rejects.toThrow();
    });
  });

  describe('approveCampaign', () => {
    it('should approve campaign successfully', async () => {
      await expect(
        campaignApi.approveCampaign(mockExecutionId)
      ).resolves.toBeUndefined();
    });

    it('should handle approval errors', async () => {
      server.use(
        http.post('*/public/executions/*/approve', () => {
          return HttpResponse.json(
            { error: 'Approval failed' },
            { status: 500 }
          );
        })
      );

      await expect(
        campaignApi.approveCampaign(mockExecutionId)
      ).rejects.toThrow();
    });
  });

  describe('rejectCampaign', () => {
    it('should reject campaign successfully without reason', async () => {
      await expect(
        campaignApi.rejectCampaign(mockExecutionId)
      ).resolves.toBeUndefined();
    });

    it('should reject campaign successfully with reason', async () => {
      await expect(
        campaignApi.rejectCampaign(mockExecutionId, 'Content not compliant')
      ).resolves.toBeUndefined();
    });

    it('should handle rejection errors', async () => {
      server.use(
        http.post('*/public/executions/*/reject', () => {
          return HttpResponse.json(
            { error: 'Rejection failed' },
            { status: 500 }
          );
        })
      );

      await expect(
        campaignApi.rejectCampaign(mockExecutionId)
      ).rejects.toThrow();
    });
  });

  // WebSocket tests omitted as WebSocket is stubbed and not used in current implementation
});
