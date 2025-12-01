"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const tier_service_1 = __importDefault(require("../services/tier.service"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Get all available tiers
router.get('/available', async (req, res, next) => {
    try {
        const tiers = await tier_service_1.default.getAllTiers();
        res.json(tiers);
    }
    catch (error) {
        next(error);
    }
});
// Get current user's tier limits and usage
router.get('/limits', async (req, res, next) => {
    try {
        const limits = await tier_service_1.default.getTierLimits(req.user.userId);
        res.json(limits);
    }
    catch (error) {
        next(error);
    }
});
// Get current user's usage stats
router.get('/usage', async (req, res, next) => {
    try {
        const usage = await tier_service_1.default.getUserTierUsage(req.user.userId);
        res.json(usage);
    }
    catch (error) {
        next(error);
    }
});
// Check if user can perform an action
router.post('/check', async (req, res, next) => {
    try {
        const { resource } = req.body;
        if (!resource) {
            return res.status(400).json({ error: 'Resource type is required' });
        }
        const canPerform = await tier_service_1.default.canPerformAction(req.user.userId, resource);
        const limits = await tier_service_1.default.getTierLimits(req.user.userId);
        res.json({
            canPerform,
            resource,
            current: limits.limits[resource]?.current || 0,
            max: limits.limits[resource]?.max || 0,
            tier: limits.tier.name,
        });
    }
    catch (error) {
        next(error);
    }
});
// Get usage history
router.get('/usage/history', async (req, res, next) => {
    try {
        const { resource, limit } = req.query;
        const history = await tier_service_1.default.getUsageHistory(req.user.userId, resource, limit ? parseInt(limit) : 100);
        res.json(history);
    }
    catch (error) {
        next(error);
    }
});
// Check role access
router.get('/roles/:roleType/access', async (req, res, next) => {
    try {
        const hasAccess = await tier_service_1.default.hasRoleAccess(req.user.userId, req.params.roleType);
        res.json({ hasAccess, roleType: req.params.roleType });
    }
    catch (error) {
        next(error);
    }
});
// Check advisor access
router.get('/advisor/access', async (req, res, next) => {
    try {
        const hasAccess = await tier_service_1.default.hasAdvisorAccess(req.user.userId);
        const level = await tier_service_1.default.getAdvisorLevel(req.user.userId);
        res.json({ hasAccess, level });
    }
    catch (error) {
        next(error);
    }
});
// Upgrade tier (in production, this would integrate with payment provider)
router.post('/upgrade', async (req, res, next) => {
    try {
        const { tier } = req.body;
        if (!tier) {
            return res.status(400).json({ error: 'Tier name is required' });
        }
        await tier_service_1.default.upgradeTier(req.user.userId, tier);
        const newLimits = await tier_service_1.default.getTierLimits(req.user.userId);
        res.json({
            message: 'Tier upgraded successfully',
            tier: newLimits.tier,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=tiers.routes.js.map