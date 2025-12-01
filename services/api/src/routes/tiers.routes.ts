import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import tierService from '../services/tier.service';

const router = Router();

router.use(authenticate);

// Get all available tiers
router.get('/available', async (req: AuthRequest, res, next) => {
  try {
    const tiers = await tierService.getAllTiers();
    res.json(tiers);
  } catch (error) {
    next(error);
  }
});

// Get current user's tier limits and usage
router.get('/limits', async (req: AuthRequest, res, next) => {
  try {
    const limits = await tierService.getTierLimits(req.user!.userId);
    res.json(limits);
  } catch (error) {
    next(error);
  }
});

// Get current user's usage stats
router.get('/usage', async (req: AuthRequest, res, next) => {
  try {
    const usage = await tierService.getUserTierUsage(req.user!.userId);
    res.json(usage);
  } catch (error) {
    next(error);
  }
});

// Check if user can perform an action
router.post('/check', async (req: AuthRequest, res, next) => {
  try {
    const { resource } = req.body;

    if (!resource) {
      return res.status(400).json({ error: 'Resource type is required' });
    }

    const canPerform = await tierService.canPerformAction(req.user!.userId, resource);
    const limits = await tierService.getTierLimits(req.user!.userId);

    res.json({
      canPerform,
      resource,
      current: limits.limits[resource as keyof typeof limits.limits]?.current || 0,
      max: limits.limits[resource as keyof typeof limits.limits]?.max || 0,
      tier: limits.tier.name,
    });
  } catch (error) {
    next(error);
  }
});

// Get usage history
router.get('/usage/history', async (req: AuthRequest, res, next) => {
  try {
    const { resource, limit } = req.query;

    const history = await tierService.getUsageHistory(
      req.user!.userId,
      resource as any,
      limit ? parseInt(limit as string) : 100
    );

    res.json(history);
  } catch (error) {
    next(error);
  }
});

// Check role access
router.get('/roles/:roleType/access', async (req: AuthRequest, res, next) => {
  try {
    const hasAccess = await tierService.hasRoleAccess(req.user!.userId, req.params.roleType);
    res.json({ hasAccess, roleType: req.params.roleType });
  } catch (error) {
    next(error);
  }
});

// Check advisor access
router.get('/advisor/access', async (req: AuthRequest, res, next) => {
  try {
    const hasAccess = await tierService.hasAdvisorAccess(req.user!.userId);
    const level = await tierService.getAdvisorLevel(req.user!.userId);
    res.json({ hasAccess, level });
  } catch (error) {
    next(error);
  }
});

// Upgrade tier (in production, this would integrate with payment provider)
router.post('/upgrade', async (req: AuthRequest, res, next) => {
  try {
    const { tier } = req.body;

    if (!tier) {
      return res.status(400).json({ error: 'Tier name is required' });
    }

    await tierService.upgradeTier(req.user!.userId, tier);
    const newLimits = await tierService.getTierLimits(req.user!.userId);

    res.json({
      message: 'Tier upgraded successfully',
      tier: newLimits.tier,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

