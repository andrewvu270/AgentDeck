import rateLimit from 'express-rate-limit';

// Rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for API endpoints
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please slow down',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
