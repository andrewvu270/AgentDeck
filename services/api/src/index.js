"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const redis_1 = require("./config/redis");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const agents_routes_1 = __importDefault(require("./routes/agents.routes"));
const executions_routes_1 = __importDefault(require("./routes/executions.routes"));
const apiKeys_routes_1 = __importDefault(require("./routes/apiKeys.routes"));
const tiers_routes_1 = __importDefault(require("./routes/tiers.routes"));
const workspace_routes_1 = __importDefault(require("./routes/workspace.routes"));
const events_routes_1 = __importDefault(require("./routes/events.routes"));
const advisor_routes_1 = __importDefault(require("./routes/advisor.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Rate limiters
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// HTTPS redirect in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        }
        else {
            next();
        }
    });
}
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/auth', authLimiter, auth_routes_1.default);
app.use('/api/agents', apiLimiter, agents_routes_1.default);
app.use('/api/executions', apiLimiter, executions_routes_1.default);
app.use('/api/keys', apiLimiter, apiKeys_routes_1.default);
app.use('/api/tiers', apiLimiter, tiers_routes_1.default);
app.use('/api/workspace', apiLimiter, workspace_routes_1.default);
app.use('/api/events', apiLimiter, events_routes_1.default);
app.use('/api/advisor', apiLimiter, advisor_routes_1.default);
// Error handler
app.use(errorHandler_1.errorHandler);
// Start server
const start = async () => {
    try {
        await (0, redis_1.connectRedis)();
        console.log('✓ Redis connected');
        app.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map