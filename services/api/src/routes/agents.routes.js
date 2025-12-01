"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const agent_service_1 = __importDefault(require("../services/agent.service"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', async (req, res, next) => {
    try {
        const agent = await agent_service_1.default.create(req.user.userId, req.body);
        res.json(agent);
    }
    catch (error) {
        next(error);
    }
});
router.get('/', async (req, res, next) => {
    try {
        const agents = await agent_service_1.default.list(req.user.userId);
        res.json(agents);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const agent = await agent_service_1.default.get(req.params.id, req.user.userId);
        res.json(agent);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const agent = await agent_service_1.default.update(req.params.id, req.user.userId, req.body);
        res.json(agent);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        await agent_service_1.default.delete(req.params.id, req.user.userId);
        res.json({ message: 'Agent deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
router.post('/:id/rollback', async (req, res, next) => {
    try {
        const { version } = req.body;
        const agent = await agent_service_1.default.rollback(req.params.id, req.user.userId, version);
        res.json(agent);
    }
    catch (error) {
        next(error);
    }
});
// Role-based endpoints
router.get('/roles/templates', async (req, res, next) => {
    try {
        const templates = await agent_service_1.default.getAllRoleTemplates();
        res.json(templates);
    }
    catch (error) {
        next(error);
    }
});
router.get('/roles/templates/:roleType', async (req, res, next) => {
    try {
        const template = await agent_service_1.default.getRoleTemplate(req.params.roleType);
        if (!template) {
            return res.status(404).json({ error: 'Role template not found' });
        }
        res.json(template);
    }
    catch (error) {
        next(error);
    }
});
router.get('/by-role/:roleType', async (req, res, next) => {
    try {
        const agents = await agent_service_1.default.getByRole(req.user.userId, req.params.roleType);
        res.json(agents);
    }
    catch (error) {
        next(error);
    }
});
router.get('/advisor/agent', async (req, res, next) => {
    try {
        const agent = await agent_service_1.default.getAdvisorAgent(req.user.userId);
        if (!agent) {
            return res.status(404).json({ error: 'Advisor agent not found' });
        }
        res.json(agent);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;
        await agent_service_1.default.updateStatus(req.params.id, req.user.userId, status);
        res.json({ message: 'Agent status updated successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=agents.routes.js.map