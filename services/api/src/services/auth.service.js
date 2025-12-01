"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../config/database");
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../middleware/errorHandler");
const SALT_ROUNDS = 12;
// Validation helpers
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new errorHandler_1.AppError(400, 'INVALID_EMAIL', 'Invalid email format');
    }
}
function validatePassword(password) {
    if (password.length < 8) {
        throw new errorHandler_1.AppError(400, 'WEAK_PASSWORD', 'Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        throw new errorHandler_1.AppError(400, 'WEAK_PASSWORD', 'Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        throw new errorHandler_1.AppError(400, 'WEAK_PASSWORD', 'Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        throw new errorHandler_1.AppError(400, 'WEAK_PASSWORD', 'Password must contain at least one number');
    }
}
class AuthService {
    async register(email, password) {
        // Validate input
        validateEmail(email);
        validatePassword(password);
        // Check if user exists
        const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            throw new errorHandler_1.AppError(400, 'USER_EXISTS', 'User with this email already exists');
        }
        // Hash password
        const passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Create user
        const result = await (0, database_1.query)('INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, email_verified, created_at', [email, passwordHash]);
        const user = result.rows[0];
        // Generate tokens
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, email: user.email });
        // Store refresh token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await (0, database_1.query)('INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)', [user.id, refreshToken, expiresAt]);
        return { accessToken, refreshToken, user };
    }
    async login(email, password) {
        // Validate email format
        validateEmail(email);
        // Find user
        const result = await (0, database_1.query)('SELECT id, email, password_hash, email_verified, created_at FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            throw new errorHandler_1.AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }
        const user = result.rows[0];
        // Verify password
        const isValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isValid) {
            throw new errorHandler_1.AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }
        // Generate tokens
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, email: user.email });
        // Store refresh token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await (0, database_1.query)('INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)', [user.id, refreshToken, expiresAt]);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                email_verified: user.email_verified,
                created_at: user.created_at,
            },
        };
    }
    async refreshAccessToken(refreshToken) {
        // Verify refresh token exists and is valid
        const result = await (0, database_1.query)('SELECT user_id, expires_at FROM sessions WHERE refresh_token = $1', [refreshToken]);
        if (result.rows.length === 0) {
            throw new errorHandler_1.AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token');
        }
        const session = result.rows[0];
        if (new Date(session.expires_at) < new Date()) {
            throw new errorHandler_1.AppError(401, 'EXPIRED_REFRESH_TOKEN', 'Refresh token has expired');
        }
        // Get user
        const userResult = await (0, database_1.query)('SELECT id, email FROM users WHERE id = $1', [
            session.user_id,
        ]);
        const user = userResult.rows[0];
        // Generate new access token
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email });
        return { accessToken };
    }
    async logout(refreshToken) {
        await (0, database_1.query)('DELETE FROM sessions WHERE refresh_token = $1', [refreshToken]);
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
//# sourceMappingURL=auth.service.js.map