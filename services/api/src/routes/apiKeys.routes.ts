import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { encrypt, decrypt } from '../utils/encryption';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { provider, apiKey, name } = req.body;
    
    if (!provider || !apiKey) {
      throw new AppError(400, 'MISSING_FIELDS', 'Provider and API key are required');
    }
    
    const encryptedKey = encrypt(apiKey);
    
    const result = await query(
      `INSERT INTO api_keys (user_id, provider, encrypted_key, name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, provider, name) 
       DO UPDATE SET encrypted_key = $3, last_used_at = NOW()
       RETURNING id, user_id, provider, name, created_at`,
      [req.user!.userId, provider, encryptedKey, name || 'default']
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      'SELECT id, provider, name, created_at, last_used_at FROM api_keys WHERE user_id = $1',
      [req.user!.userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await query('DELETE FROM api_keys WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user!.userId,
    ]);
    
    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
