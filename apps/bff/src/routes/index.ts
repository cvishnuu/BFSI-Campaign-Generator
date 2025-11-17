import { Router } from 'express';
import { z } from 'zod';
import { getAuth, requireAuth } from '@clerk/express';
import { getUsage, incrementUsage, upsertUser } from '../services/user-service.js';

const router = Router();

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

router.post('/campaigns/execute', async (req, res, next) => {
  try {
    const parsed = executionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const executionId = `exec_${Date.now()}`;

    // Track usage; rowsProcessed based on csv rows
    const userContext = getUserContext(req);
    if (!userContext) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await incrementUsage(userContext.userId, 1, parsed.data.csvData.length);

    res.status(201).json({
      executionId,
      status: 'running',
      message: 'Campaign started',
    });
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
