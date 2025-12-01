import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import executionService from '../services/execution.service';

const router = Router();

router.use(authenticate);

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { agentId, input } = req.body;
    const execution = await executionService.execute(agentId, req.user!.userId, input);
    res.json(execution);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { agentId } = req.query;
    const executions = await executionService.list(
      req.user!.userId,
      agentId as string | undefined
    );
    res.json(executions);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const execution = await executionService.get(req.params.id, req.user!.userId);
    res.json(execution);
  } catch (error) {
    next(error);
  }
});

export default router;
