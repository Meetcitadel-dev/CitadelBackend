import { Router } from 'express';
import chatController from '../controllers/chat.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/v1/chats/active - Get active conversations (connected users)
router.get('/active', chatController.getActiveConversations);

// GET /api/v1/chats/matches - Get matched conversations (matched users)
router.get('/matches', chatController.getMatchedConversations);

// GET /api/v1/chats/{conversationId}/messages - Get conversation messages
router.get('/:conversationId/messages', chatController.getConversationMessages);

// POST /api/v1/chats/{conversationId}/messages - Send message
router.post('/:conversationId/messages', chatController.sendMessage);

// POST /api/v1/chats/{conversationId}/read - Mark messages as read
router.post('/:conversationId/read', chatController.markAsRead);

// GET /api/v1/chats/conversation/{userId} - Get or create conversation by user ID
router.get('/conversation/:targetUserId', chatController.getConversationByUserId);

// GET /api/v1/chats/conversation/details/{conversationId} - Get conversation details by conversation ID
router.get('/conversation/details/:conversationId', chatController.getConversationDetails);

export default router; 