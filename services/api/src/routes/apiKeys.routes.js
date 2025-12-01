"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const encryption_1 = require("../utils/encryption");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', async (req, res, next) => {
    try {
        const { provider, apiKey, name } = req.body;
        if (!provider || !apiKey) {
            throw new errorHandler_1.AppError(400, 'MISSING_FIELDS', 'Provider and API key are required');
        }
        const encryptedKey = (0, encryption_1.encrypt)(apiKey);
        const result = await (0, database_1.query)(`INSERT INTO api_keys (user_id, provider, encrypted_key, name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, provider, name) 
       DO UPDATE SET encrypted_key = $3, last_used_at = NOW()
       RETURNING id, user_id, provider, name, created_at`, [req.user.userId, provider, encryptedKey, name || 'default']);
        res.json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
router.get('/', async (req, res, next) => {
    try {
        const result = await (0, database_1.query)('SELECT id, provider, name, created_at, last_used_at FROM api_keys WHERE user_id = $1', [req.user.userId]);
        res.json(result.rows);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        await (0, database_1.query)('DELETE FROM api_keys WHERE id = $1 AND user_id = $2', [
            req.params.id,
            req.user.userId,
        ]);
        res.json({ message: 'API key deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=apiKeys.routes.js.map