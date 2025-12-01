"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const execution_service_1 = __importDefault(require("../services/execution.service"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', async (req, res, next) => {
    try {
        const { agentId, input } = req.body;
        const execution = await execution_service_1.default.execute(agentId, req.user.userId, input);
        res.json(execution);
    }
    catch (error) {
        next(error);
    }
});
router.get('/', async (req, res, next) => {
    try {
        const { agentId } = req.query;
        const executions = await execution_service_1.default.list(req.user.userId, agentId);
        res.json(executions);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const execution = await execution_service_1.default.get(req.params.id, req.user.userId);
        res.json(execution);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=executions.routes.js.map