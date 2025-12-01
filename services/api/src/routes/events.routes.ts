import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import eventHookService from '../services/eventHook.service';

const router = Router();
router.use(authenticate);

// Subscriptions
router.post('/subscriptions', async (req: AuthRequest, res, next) => {
  try {
    const { agentId, eventType, filters } = req.body;
    const subscription = await eventHookService.subscribeAgent(
      req.user!.userId,
      agentId,
      eventType,
      filters
    );
    res.json(subscription);
  } catch (error) {
    next(error);
  }
});

router.delete('/subscriptions/:id', async (req: AuthRequest, res, next) => {
  try {
    const { agentId, eventType } = req.body;
    await eventHookService.unsubscribeAgent(req.user!.userId, agentId, eventType);
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/subscriptions/agent/:agentId', async (req: AuthRequest, res, next) => {
  try {
    const subscriptions = await eventHookService.getAgentSubscriptions(req.params.agentId);
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
});

// Webhook endpoint for external events
router.post('/webhook', async (req: AuthRequest, res, next) => {
  try {
    const { eventType, source, data, metadata } = req.body;
    const event = await eventHookService.handleEvent(
      req.user!.userId,
      eventType,
      source,
      data,
      metadata
    );
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// Event history
router.get('/history', async (req: AuthRequest, res, next) => {
  try {
    const { eventType, limit } = req.query;
    const events = await eventHookService.getEventHistory(
      req.user!.userId,
      eventType as any,
      limit ? parseInt(limit as string) : 50
    );
    res.json(events);
  } catch (error) {
    next(error);
  }
});

export default router;
