import { Router } from 'express';
import { z } from 'zod';
import { getAuth, requireAuth } from '@clerk/express';
import { getUsage, incrementUsage, upsertUser } from '../services/user-service.js';
import axios from 'axios';

const router = Router();

// Workflow backend configuration
const WORKFLOW_API_URL = process.env.WORKFLOW_API_URL || 'http://localhost:3001/api/v1';
const WORKFLOW_API_KEY = process.env.WORKFLOW_API_KEY || 'wf_nN1aPZUxLCdmyMFTYa04MUhq4XdOpgEh3WqXQVQa3lw';
const WORKFLOW_ID = 'workflow_bfsi_marketing_template';

const getUserContext = (req: Parameters<typeof getAuth>[0]) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return null;
  }

  const claims = auth.sessionClaims as Record<string, unknown> | undefined;
  const emailClaim = (claims?.email as string) || (claims?.email_addresses as string[])?.[0] || '';
  const nameClaim = (claims?.name as string) || '';

  return {
    userId: auth.userId,
    email: emailClaim || 'unknown@example.com',
    name: nameClaim || null,
  };
};

const executionSchema = z.object({
  csvData: z.array(z.record(z.any())).min(1),
  prompt: z.string().min(1),
  tone: z.string().default('professional'),
});

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use(requireAuth());

router.get('/me', async (req, res, next) => {
  try {
    const userContext = getUserContext(req);
    if (!userContext) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await upsertUser(userContext.userId, userContext.email, userContext.name);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.get('/usage', async (req, res, next) => {
  try {
    const userContext = getUserContext(req);
    if (!userContext) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const usage = await getUsage(userContext.userId);
    res.json({ usage });
  } catch (err) {
    next(err);
  }
});

// NEW: Validate and increment usage without executing workflow
// Frontend will call this first, then call workflow API directly if validation passes
router.post('/campaigns/validate-and-track', async (req, res, next) => {
  try {
    const parsed = executionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const userContext = getUserContext(req);
    if (!userContext) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Ensure user exists in database (required for foreign key constraint)
    await upsertUser(userContext.userId, userContext.email, userContext.name);

    // Get current usage
    const usage = await getUsage(userContext.userId);

    // Enforce 10 row limit per campaign
    const MAX_ROWS_PER_CAMPAIGN = 10;
    if (parsed.data.csvData.length > MAX_ROWS_PER_CAMPAIGN) {
      return res.status(400).json({
        error: 'Row limit exceeded',
        message: `Maximum ${MAX_ROWS_PER_CAMPAIGN} rows allowed per campaign. You uploaded ${parsed.data.csvData.length} rows. Please reduce the number of rows and try again.`,
        limit: MAX_ROWS_PER_CAMPAIGN,
        provided: parsed.data.csvData.length,
      });
    }

    // Enforce 100 campaign limit (free tier)
    const MAX_CAMPAIGNS = 100;
    if (usage.campaignsGenerated >= MAX_CAMPAIGNS) {
      return res.status(403).json({
        error: 'Campaign limit reached',
        message: `You have reached your free tier limit of ${MAX_CAMPAIGNS} campaigns. Please upgrade your plan to continue.`,
        limit: MAX_CAMPAIGNS,
        current: usage.campaignsGenerated,
      });
    }

    // Track usage (increment campaign count and rows processed)
    await incrementUsage(userContext.userId, 1, parsed.data.csvData.length);

    // Return success - frontend will now call workflow API directly
    res.status(200).json({
      success: true,
      message: 'Campaign validated and usage tracked. You can now proceed to execute the workflow.',
      rowCount: parsed.data.csvData.length,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/campaigns/execute', async (req, res, next) => {
  try {
    const parsed = executionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const userContext = getUserContext(req);
    if (!userContext) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Ensure user exists in database (required for foreign key constraint)
    await upsertUser(userContext.userId, userContext.email, userContext.name);

    // Get current usage
    const usage = await getUsage(userContext.userId);

    // Enforce 10 row limit per campaign
    const MAX_ROWS_PER_CAMPAIGN = 10;
    if (parsed.data.csvData.length > MAX_ROWS_PER_CAMPAIGN) {
      return res.status(400).json({
        error: 'Row limit exceeded',
        message: `Maximum ${MAX_ROWS_PER_CAMPAIGN} rows allowed per campaign. You uploaded ${parsed.data.csvData.length} rows. Please reduce the number of rows and try again.`,
        limit: MAX_ROWS_PER_CAMPAIGN,
        provided: parsed.data.csvData.length,
      });
    }

    // Enforce 100 campaign limit (free tier)
    const MAX_CAMPAIGNS = 100;
    if (usage.campaignsGenerated >= MAX_CAMPAIGNS) {
      return res.status(403).json({
        error: 'Campaign limit reached',
        message: `You have reached your free tier limit of ${MAX_CAMPAIGNS} campaigns. Please upgrade your plan to continue.`,
        limit: MAX_CAMPAIGNS,
        current: usage.campaignsGenerated,
      });
    }

    // Track usage BEFORE calling workflow (so it's tracked even if workflow fails)
    await incrementUsage(userContext.userId, 1, parsed.data.csvData.length);

    // Forward request to workflow backend
    const workflowResponse = await axios.post(
      `${WORKFLOW_API_URL}/public/agents/${WORKFLOW_ID}/execute`,
      {
        csvData: parsed.data.csvData,
        executionInput: {
          prompt: parsed.data.prompt,
          tone: parsed.data.tone,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${WORKFLOW_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(201).json(workflowResponse.data);
  } catch (err) {
    next(err);
  }
});

router.get('/campaigns/:id/status', async (req, res, next) => {
  try {
    res.json({
      executionId: req.params.id,
      workflowId: 'bfsi-campaign',
      status: 'completed',
      startedAt: new Date(Date.now() - 60_000).toISOString(),
      completedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/campaigns/:id/results', async (req, res, next) => {
  try {
    res.json({
      executionId: req.params.id,
      status: 'completed',
      results: {
        generatedContent: [
          {
            row: 1,
            name: 'Sample Customer',
            message: 'Sample generated message',
            complianceScore: 95,
            complianceStatus: 'pass',
            violations: [],
          },
        ],
      },
      output: {},
    });
  } catch (err) {
    next(err);
  }
});

router.get('/campaigns/:id/pending-approval', async (req, res, next) => {
  try {
    res.json({
      executionId: req.params.id,
      workflowId: 'bfsi-campaign',
      status: 'pending_approval',
      approvalData: {
        generatedContent: [
          {
            row: 1,
            name: 'Sample Customer',
            message: 'Sample generated message',
            complianceScore: 95,
            complianceStatus: 'pass',
            violations: [],
          },
        ],
      },
      startedAt: new Date(Date.now() - 60_000).toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/campaigns/:id/approve', async (_req, res, next) => {
  try {
    res.json({ status: 'approved' });
  } catch (err) {
    next(err);
  }
});

router.post('/campaigns/:id/reject', async (_req, res, next) => {
  try {
    res.json({ status: 'rejected' });
  } catch (err) {
    next(err);
  }
});

export default router;
