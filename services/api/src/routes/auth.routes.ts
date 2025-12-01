import { Router } from 'express';
import authService from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new AppError(400, 'MISSING_FIELDS', 'Email and password are required');
    }
    
    const result = await authService.register(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new AppError(400, 'MISSING_FIELDS', 'Email and password are required');
    }
    
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AppError(400, 'MISSING_REFRESH_TOKEN', 'Refresh token is required');
    }
    
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
