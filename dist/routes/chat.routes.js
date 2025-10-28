"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = __importDefault(require("../controllers/chat.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// GET /api/v1/chats/active - Get active conversations (connected users)
router.get('/active', chat_controller_1.default.getActiveConversations);
// GET /api/v1/chats/matches - Get matched conversations (matched users)
router.get('/matches', chat_controller_1.default.getMatchedConversations);
// GET /api/v1/chats/{conversationId}/messages - Get conversation messages
router.get('/:conversationId/messages', chat_controller_1.default.getConversationMessages);
// POST /api/v1/chats/{conversationId}/messages - Send message
router.post('/:conversationId/messages', chat_controller_1.default.sendMessage);
// POST /api/v1/chats/{conversationId}/read - Mark messages as read
router.post('/:conversationId/read', chat_controller_1.default.markAsRead);
// GET /api/v1/chats/conversation/{userId} - Get or create conversation by user ID
router.get('/conversation/:targetUserId', chat_controller_1.default.getConversationByUserId);
// GET /api/v1/chats/conversation/details/{conversationId} - Get conversation details by conversation ID
router.get('/conversation/details/:conversationId', chat_controller_1.default.getConversationDetails);
exports.default = router;
