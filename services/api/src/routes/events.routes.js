"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const eventHook_service_1 = __importDefault(require("../services/eventHook.service"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Subscriptions
router.post('/subscriptions', async (req, res, next) => {
    try {
        const { agentId, eventType, filters } = req.body;
        const subscription = await eventHook_service_1.default.subscribeAgent(req.user.userId, agentId, eventType, filters);
        res.json(subscription);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/subscriptions/:id', async (req, res, next) => {
    try {
        const { agentId, eventType } = req.body;
        await eventHook_service_1.default.unsubscribeAgent(req.user.userId, agentId, eventType);
        res.json({ message: 'Unsubscribed successfully' });
    }
    catch (error) {
        next(error);
    }
});
router.get('/subscriptions/agent/:agentId', async (req, res, next) => {
    try {
        const subscriptions = await eventHook_service_1.default.getAgentSubscriptions(req.params.agentId);
        res.json(subscriptions);
    }
    catch (error) {
        next(error);
    }
});
// Webhook endpoint for external events
router.post('/webhook', async (req, res, next) => {
    try {
        const { eventType, source, data, metadata } = req.body;
        const event = await eventHook_service_1.default.handleEvent(req.user.userId, eventType, source, data, metadata);
        res.json(event);
    }
    catch (error) {
        next(error);
    }
});
// Event history
router.get('/history', async (req, res, next) => {
    try {
        const { eventType, limit } = req.query;
        const events = await eventHook_service_1.default.getEventHistory(req.user.userId, eventType, limit ? parseInt(limit) : 50);
        res.json(events);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=events.routes.js.map