import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import advisorAgentService from '../services/advisorAgent.service';

const router = Router();
router.use(authenticate);

// Get latest summary
router.get('/summary', async (req: AuthRequest, res, next) => {
  try {
    const summary = await advisorAgentService.getLatestSummary(req.user!.userId);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// Generate new summary
router.post('/summary/generate', async (req: AuthRequest, res, next) => {
  try {
    const { timeRangeStart, timeRangeEnd } = req.body;
    const summary = await advisorAgentService.generateSummary(
      req.user!.userId,
      new Date(timeRangeStart || Date.now() - 7 * 24 * 60 * 60 * 1000), // Default: last 7 days
      new Date(timeRangeEnd || Date.now())
    );
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

export default router;
