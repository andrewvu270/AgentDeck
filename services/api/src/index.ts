import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import agentsRoutes from './routes/agents.routes';
import executionsRoutes from './routes/executions.routes';
import apiKeysRoutes from './routes/apiKeys.routes';
import tiersRoutes from './routes/tiers.routes';
import workspaceRoutes from './routes/workspace.routes';
import eventsRoutes from './routes/events.routes';
import advisorRoutes from './routes/advisor.routes';
import mcpRoutes from './routes/mcp.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true 
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTPS redirect in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/agents', apiLimiter, agentsRoutes);
app.use('/api/executions', apiLimiter, executionsRoutes);
app.use('/api/keys', apiLimiter, apiKeysRoutes);
app.use('/api/tiers', apiLimiter, tiersRoutes);
app.use('/api/workspace', apiLimiter, workspaceRoutes);
app.use('/api/events', apiLimiter, eventsRoutes);
app.use('/api/advisor', apiLimiter, advisorRoutes);
app.use('/api/mcp', apiLimiter, mcpRoutes);

// Error handler
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectRedis();
    console.log('✓ Redis connected');
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
