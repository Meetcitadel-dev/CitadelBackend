import express from 'express';
import enhancedChatController from '../controllers/enhancedChat.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

// Enhanced chat routes with authentication
router.use(authenticateToken);

// Get matched conversations (enhanced system)
router.get('/matches', enhancedChatController.getMatchedConversations);

// Send connection request (Case 3)
router.post('/connection-request', enhancedChatController.sendConnectionRequest);

// Dismiss match prompt
router.post('/dismiss', enhancedChatController.dismissMatchPrompt);

// Move chat to active section
router.post('/move-to-active', enhancedChatController.moveChatToActive);

// Check chat history
router.get('/chat-history/:targetUserId', enhancedChatController.checkChatHistory);

// Send message with enhanced validation
router.post('/send-message', enhancedChatController.sendMessage);

export default router; 