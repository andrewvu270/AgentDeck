import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import workspaceService from '../services/workspace.service';
import collaborationTableService from '../services/collaborationTable.service';
import orchestratorService from '../services/orchestrator.service';

const router = Router();
router.use(authenticate);

// Conversations
router.post('/conversations', async (req: AuthRequest, res, next) => {
  try {
    const conversation = await workspaceService.createConversation(req.user!.userId, req.body);
    res.json(conversation);
  } catch (error) {
    next(error);
  }
});

router.get('/conversations', async (req: AuthRequest, res, next) => {
  try {
    const { status, limit } = req.query;
    const conversations = await workspaceService.listConversations(
      req.user!.userId,
      status as any,
      limit ? parseInt(limit as string) : 50
    );
    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

router.get('/conversations/:id', async (req: AuthRequest, res, next) => {
  try {
    const conversation = await workspaceService.getConversation(req.params.id, req.user!.userId);
    const messages = await workspaceService.getConversationHistory(req.params.id, req.user!.userId);
    res.json({ conversation, messages });
  } catch (error) {
    next(error);
  }
});

router.post('/conversations/:id/messages', async (req: AuthRequest, res, next) => {
  try {
    const message = await workspaceService.addMessage(req.params.id, {
      ...req.body,
      sender_type: 'user',
      sender_id: req.user!.userId,
      sender_name: req.user!.email,
    });
    
    // Get conversation to determine mode
    const conversation = await workspaceService.getConversation(req.params.id, req.user!.userId);
    
    // Trigger orchestrator to coordinate agent responses
    // This runs asynchronously - don't wait for it
    orchestratorService.startCollaboration(req.user!.userId, req.params.id, conversation.mode as any)
      .catch(err => console.error('Orchestrator error:', err));
    
    res.json(message);
  } catch (error) {
    next(error);
  }
});

router.put('/conversations/:id/archive', async (req: AuthRequest, res, next) => {
  try {
    await workspaceService.archiveConversation(req.params.id, req.user!.userId);
    res.json({ message: 'Conversation archived' });
  } catch (error) {
    next(error);
  }
});

router.put('/conversations/:id/reopen', async (req: AuthRequest, res, next) => {
  try {
    await workspaceService.reopenConversation(req.params.id, req.user!.userId);
    res.json({ message: 'Conversation reopened' });
  } catch (error) {
    next(error);
  }
});

// Collaboration Tables
router.post('/tables', async (req: AuthRequest, res, next) => {
  try {
    const table = await collaborationTableService.createTable(req.user!.userId, req.body);
    res.json(table);
  } catch (error) {
    next(error);
  }
});

router.get('/tables', async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.query;
    const tables = await collaborationTableService.listTables(req.user!.userId, status as any);
    res.json(tables);
  } catch (error) {
    next(error);
  }
});

router.get('/tables/:id', async (req: AuthRequest, res, next) => {
  try {
    const table = await collaborationTableService.getTable(req.params.id, req.user!.userId);
    res.json(table);
  } catch (error) {
    next(error);
  }
});

router.post('/tables/:id/advance', async (req: AuthRequest, res, next) => {
  try {
    const table = await collaborationTableService.advancePhase(req.params.id, req.user!.userId);
    res.json(table);
  } catch (error) {
    next(error);
  }
});

// Search
router.get('/search', async (req: AuthRequest, res, next) => {
  try {
    const { q, limit } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const messages = await workspaceService.searchMessages(
      req.user!.userId,
      q as string,
      limit ? parseInt(limit as string) : 50
    );
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

export default router;
