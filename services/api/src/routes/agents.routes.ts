import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import agentService from '../services/agent.service';

const router = Router();

router.use(authenticate);

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const agent = await agentService.create(req.user!.userId, req.body);
    res.json(agent);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const agents = await agentService.list(req.user!.userId);
    res.json(agents);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const agent = await agentService.get(req.params.id, req.user!.userId);
    res.json(agent);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const agent = await agentService.update(req.params.id, req.user!.userId, req.body);
    res.json(agent);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await agentService.delete(req.params.id, req.user!.userId);
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/rollback', async (req: AuthRequest, res, next) => {
  try {
    const { version } = req.body;
    const agent = await agentService.rollback(req.params.id, req.user!.userId, version);
    res.json(agent);
  } catch (error) {
    next(error);
  }
});

// Role-based endpoints
router.get('/roles/templates', async (req: AuthRequest, res, next) => {
  try {
    const templates = await agentService.getAllRoleTemplates();
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

router.get('/roles/templates/:roleType', async (req: AuthRequest, res, next) => {
  try {
    const template = await agentService.getRoleTemplate(req.params.roleType as any);
    if (!template) {
      return res.status(404).json({ error: 'Role template not found' });
    }
    res.json(template);
  } catch (error) {
    next(error);
  }
});

router.get('/by-role/:roleType', async (req: AuthRequest, res, next) => {
  try {
    const agents = await agentService.getByRole(req.user!.userId, req.params.roleType as any);
    res.json(agents);
  } catch (error) {
    next(error);
  }
});

router.get('/advisor/agent', async (req: AuthRequest, res, next) => {
  try {
    const agent = await agentService.getAdvisorAgent(req.user!.userId);
    if (!agent) {
      return res.status(404).json({ error: 'Advisor agent not found' });
    }
    res.json(agent);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.body;
    await agentService.updateStatus(req.params.id, req.user!.userId, status);
    res.json({ message: 'Agent status updated successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
