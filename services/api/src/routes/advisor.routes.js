"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const advisorAgent_service_1 = __importDefault(require("../services/advisorAgent.service"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Get latest summary
router.get('/summary', async (req, res, next) => {
    try {
        const summary = await advisorAgent_service_1.default.getLatestSummary(req.user.userId);
        res.json(summary);
    }
    catch (error) {
        next(error);
    }
});
// Generate new summary
router.post('/summary/generate', async (req, res, next) => {
    try {
        const { timeRangeStart, timeRangeEnd } = req.body;
        const summary = await advisorAgent_service_1.default.generateSummary(req.user.userId, new Date(timeRangeStart || Date.now() - 7 * 24 * 60 * 60 * 1000), // Default: last 7 days
        new Date(timeRangeEnd || Date.now()));
        res.json(summary);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=advisor.routes.js.map