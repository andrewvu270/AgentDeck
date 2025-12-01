"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workspace_service_1 = __importDefault(require("../services/workspace.service"));
const collaborationTable_service_1 = __importDefault(require("../services/collaborationTable.service"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Conversations
router.post('/conversations', async (req, res, next) => {
    try {
        const conversation = await workspace_service_1.default.createConversation(req.user.userId, req.body);
        res.json(conversation);
    }
    catch (error) {
        next(error);
    }
});
router.get('/conversations', async (req, res, next) => {
    try {
        const { status, limit } = req.query;
        const conversations = await workspace_service_1.default.listConversations(req.user.userId, status, limit ? parseInt(limit) : 50);
        res.json(conversations);
    }
    catch (error) {
        next(error);
    }
});
router.get('/conversations/:id', async (req, res, next) => {
    try {
        const conversation = await workspace_service_1.default.getConversation(req.params.id, req.user.userId);
        const messages = await workspace_service_1.default.getConversationHistory(req.params.id, req.user.userId);
        res.json({ conversation, messages });
    }
    catch (error) {
        next(error);
    }
});
router.post('/conversations/:id/messages', async (req, res, next) => {
    try {
        const message = await workspace_service_1.default.addMessage(req.params.id, {
            ...req.body,
            sender_type: 'user',
            sender_id: req.user.userId,
            sender_name: req.user.email,
        });
        res.json(message);
    }
    catch (error) {
        next(error);
    }
});
router.put('/conversations/:id/archive', async (req, res, next) => {
    try {
        await workspace_service_1.default.archiveConversation(req.params.id, req.user.userId);
        res.json({ message: 'Conversation archived' });
    }
    catch (error) {
        next(error);
    }
});
router.put('/conversations/:id/reopen', async (req, res, next) => {
    try {
        await workspace_service_1.default.reopenConversation(req.params.id, req.user.userId);
        res.json({ message: 'Conversation reopened' });
    }
    catch (error) {
        next(error);
    }
});
// Collaboration Tables
router.post('/tables', async (req, res, next) => {
    try {
        const table = await collaborationTable_service_1.default.createTable(req.user.userId, req.body);
        res.json(table);
    }
    catch (error) {
        next(error);
    }
});
router.get('/tables', async (req, res, next) => {
    try {
        const { status } = req.query;
        const tables = await collaborationTable_service_1.default.listTables(req.user.userId, status);
        res.json(tables);
    }
    catch (error) {
        next(error);
    }
});
router.get('/tables/:id', async (req, res, next) => {
    try {
        const table = await collaborationTable_service_1.default.getTable(req.params.id, req.user.userId);
        res.json(table);
    }
    catch (error) {
        next(error);
    }
});
router.post('/tables/:id/advance', async (req, res, next) => {
    try {
        const table = await collaborationTable_service_1.default.advancePhase(req.params.id, req.user.userId);
        res.json(table);
    }
    catch (error) {
        next(error);
    }
});
// Search
router.get('/search', async (req, res, next) => {
    try {
        const { q, limit } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }
        const messages = await workspace_service_1.default.searchMessages(req.user.userId, q, limit ? parseInt(limit) : 50);
        res.json(messages);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=workspace.routes.js.map