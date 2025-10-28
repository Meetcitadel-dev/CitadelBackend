"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enhancedChat_controller_1 = __importDefault(require("../controllers/enhancedChat.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Enhanced chat routes with authentication
router.use(auth_middleware_1.authenticateToken);
// Get matched conversations (enhanced system)
router.get('/matches', enhancedChat_controller_1.default.getMatchedConversations);
// Send connection request (Case 3)
router.post('/connection-request', enhancedChat_controller_1.default.sendConnectionRequest);
// Dismiss match prompt
router.post('/dismiss', enhancedChat_controller_1.default.dismissMatchPrompt);
// Move chat to active section
router.post('/move-to-active', enhancedChat_controller_1.default.moveChatToActive);
// Check chat history
router.get('/chat-history/:targetUserId', enhancedChat_controller_1.default.checkChatHistory);
// Send message with enhanced validation
router.post('/send-message', enhancedChat_controller_1.default.sendMessage);
exports.default = router;
