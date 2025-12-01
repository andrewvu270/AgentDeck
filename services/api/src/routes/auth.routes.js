"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("../services/auth.service"));
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new errorHandler_1.AppError(400, 'MISSING_FIELDS', 'Email and password are required');
        }
        const result = await auth_service_1.default.register(email, password);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new errorHandler_1.AppError(400, 'MISSING_FIELDS', 'Email and password are required');
        }
        const result = await auth_service_1.default.login(email, password);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.post('/refresh', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new errorHandler_1.AppError(400, 'MISSING_REFRESH_TOKEN', 'Refresh token is required');
        }
        const result = await auth_service_1.default.refreshAccessToken(refreshToken);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.post('/logout', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await auth_service_1.default.logout(refreshToken);
        }
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map