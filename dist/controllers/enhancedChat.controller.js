"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const user_model_1 = __importDefault(require("../models/user.model"));
const connection_model_1 = __importDefault(require("../models/connection.model"));
const match_model_1 = __importDefault(require("../models/match.model"));
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const notificationReadStatus_model_1 = __importDefault(require("../models/notificationReadStatus.model"));
class EnhancedChatController {
    // Get matched conversations using the new Match model
    async getMatchedConversations(req, res) {
        try {
            const userId = req.user.id;
            console.log('🔍 [ENHANCED MATCHES] Looking for matched conversations for user ID:', userId);
            // Get all matched users using the new Match model
            const matches = await match_model_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { userId1: userId },
                        { userId2: userId }
                    ]
                },
                include: [
                    {
                        model: user_model_1.default,
                        as: 'matchUser1',
                        attributes: ['id', 'name', 'username']
                    },
                    {
                        model: user_model_1.default,
                        as: 'matchUser2',
                        attributes: ['id', 'name', 'username']
                    }
                ]
            });
            console.log('💕 [ENHANCED MATCHES] Found matches:', matches.length);
            const conversations = await Promise.all(matches.map(async (match) => {
                // Get the OTHER user, not the same user
                const otherUser = match.userId1 === userId ? match.matchUser2 : match.matchUser1;
                console.log(`👤 [ENHANCED MATCHES] Other user: ${otherUser.name} (ID: ${otherUser.id})`);
                const conversation = await conversation_model_1.default.findOne({
                    where: {
                        [sequelize_1.Op.or]: [
                            { user1Id: userId, user2Id: otherUser.id },
                            { user1Id: otherUser.id, user2Id: userId }
                        ]
                    }
                });
                console.log(`💬 [ENHANCED MATCHES] Conversation found:`, conversation ? conversation.id : 'NOT FOUND');
                // Get last message
                let lastMessage = null;
                let lastMessageTime = null;
                if (conversation) {
                    const lastMsg = await message_model_1.default.findOne({
                        where: { conversationId: conversation.id },
                        order: [['createdAt', 'DESC']]
                    });
                    if (lastMsg) {
                        lastMessage = lastMsg.text;
                        lastMessageTime = lastMsg.createdAt;
                    }
                }
                // Get unread count
                let unreadCount = 0;
                if (conversation) {
                    unreadCount = await message_model_1.default.count({
                        where: {
                            conversationId: conversation.id,
                            senderId: otherUser.id,
                            status: { [sequelize_1.Op.ne]: 'read' }
                        }
                    });
                }
                // Check if users are connected
                const connection = await connection_model_1.default.findOne({
                    where: {
                        [sequelize_1.Op.or]: [
                            { userId1: userId, userId2: otherUser.id },
                            { userId1: otherUser.id, userId2: userId }
                        ],
                        status: 'connected'
                    }
                });
                // Check if users have chat history
                const hasChatHistory = conversation && await message_model_1.default.count({
                    where: { conversationId: conversation.id }
                }) > 0;
                // Determine the case
                let caseType = 'CASE_3'; // Default: Never connected
                if (connection) {
                    if (hasChatHistory) {
                        caseType = 'CASE_1'; // Already connected + already chatting
                    }
                    else {
                        caseType = 'CASE_2'; // Already connected + never chatted
                    }
                }
                return {
                    id: conversation?.id || null,
                    userId: otherUser.id,
                    name: otherUser.name || otherUser.username || 'Unknown User',
                    profileImage: null,
                    lastMessage,
                    lastMessageTime,
                    isOnline: false,
                    unreadCount,
                    caseType,
                    isConnected: !!connection,
                    hasChatHistory,
                    matchData: {
                        mutualAdjective: match.mutualAdjective,
                        iceBreakingPrompt: match.iceBreakingPrompt,
                        matchTimestamp: match.matchTimestamp
                    }
                };
            }));
            const filteredConversations = conversations.filter((conv) => conv.id !== null);
            console.log('✅ [ENHANCED MATCHES] Returning filtered conversations:', filteredConversations.length);
            res.json({
                success: true,
                conversations: filteredConversations
            });
        }
        catch (error) {
            console.error('❌ [ENHANCED MATCHES] Error fetching matched conversations:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch matched conversations'
            });
        }
    }
    // Send connection request (Case 3)
    async sendConnectionRequest(req, res) {
        try {
            const { targetUserId } = req.body;
            const currentUserId = req.user.id;
            if (!targetUserId) {
                res.status(400).json({ success: false, message: 'Target user ID is required' });
                return;
            }
            // Check if match exists
            const match = await match_model_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { userId1: currentUserId, userId2: targetUserId },
                        { userId1: targetUserId, userId2: currentUserId }
                    ]
                }
            });
            if (!match) {
                res.status(404).json({ success: false, message: 'No match found with this user' });
                return;
            }
            // Check if already connected
            const existingConnection = await connection_model_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { userId1: currentUserId, userId2: targetUserId },
                        { userId1: targetUserId, userId2: currentUserId }
                    ],
                    status: 'connected'
                }
            });
            if (existingConnection) {
                res.status(400).json({ success: false, message: 'Users are already connected' });
                return;
            }
            // Create or update connection request
            const [connection, created] = await connection_model_1.default.findOrCreate({
                where: {
                    [sequelize_1.Op.or]: [
                        { userId1: currentUserId, userId2: targetUserId },
                        { userId1: targetUserId, userId2: currentUserId }
                    ]
                },
                defaults: {
                    userId1: Math.min(currentUserId, targetUserId),
                    userId2: Math.max(currentUserId, targetUserId),
                    status: 'requested'
                }
            });
            if (!created) {
                // Update existing connection to requested status
                await connection.update({ status: 'requested' });
            }
            // Create notification for target user
            await notificationReadStatus_model_1.default.create({
                userId: targetUserId,
                notificationType: 'connection_request',
                notificationId: connection.id,
                isRead: false,
                createdAt: new Date()
            });
            res.json({
                success: true,
                message: 'Connection request sent successfully'
            });
        }
        catch (error) {
            console.error('❌ Error sending connection request:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    // Dismiss match prompt
    async dismissMatchPrompt(req, res) {
        try {
            const { targetUserId } = req.body;
            const currentUserId = req.user.id;
            if (!targetUserId) {
                res.status(400).json({ success: false, message: 'Target user ID is required' });
                return;
            }
            // For now, we'll just return success
            // In a real implementation, you might want to track dismissed prompts
            // or implement a more sophisticated dismissal system
            res.json({
                success: true,
                message: 'Match prompt dismissed successfully'
            });
        }
        catch (error) {
            console.error('❌ Error dismissing match prompt:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    // Move chat to active section
    async moveChatToActive(req, res) {
        try {
            const { targetUserId } = req.body;
            const currentUserId = req.user.id;
            if (!targetUserId) {
                res.status(400).json({ success: false, message: 'Target user ID is required' });
                return;
            }
            // Check if users are connected
            const connection = await connection_model_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { userId1: currentUserId, userId2: targetUserId },
                        { userId1: targetUserId, userId2: currentUserId }
                    ],
                    status: 'connected'
                }
            });
            if (!connection) {
                res.status(400).json({ success: false, message: 'Users must be connected to move chat to active' });
                return;
            }
            // For now, we'll just return success
            // In a real implementation, you might want to track which chats are in active vs matches
            // or implement a more sophisticated movement system
            res.json({
                success: true,
                message: 'Chat moved to active section successfully'
            });
        }
        catch (error) {
            console.error('❌ Error moving chat to active:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    // Check chat history
    async checkChatHistory(req, res) {
        try {
            const { targetUserId } = req.params;
            const currentUserId = req.user.id;
            if (!targetUserId) {
                res.status(400).json({ success: false, message: 'Target user ID is required' });
                return;
            }
            // Find conversation between users
            const conversation = await conversation_model_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { user1Id: currentUserId, user2Id: targetUserId },
                        { user1Id: targetUserId, user2Id: currentUserId }
                    ]
                }
            });
            let hasChatHistory = false;
            if (conversation) {
                const messageCount = await message_model_1.default.count({
                    where: { conversationId: conversation.id }
                });
                hasChatHistory = messageCount > 0;
            }
            res.json({
                success: true,
                hasChatHistory,
                message: hasChatHistory ? 'Users have chat history' : 'No chat history found'
            });
        }
        catch (error) {
            console.error('❌ Error checking chat history:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    // Send message with enhanced validation
    async sendMessage(req, res) {
        try {
            const { conversationId, text } = req.body;
            const senderId = req.user.id;
            if (!conversationId || !text) {
                res.status(400).json({ success: false, message: 'Conversation ID and text are required' });
                return;
            }
            // Get conversation and verify sender is part of it
            const conversation = await conversation_model_1.default.findByPk(conversationId);
            if (!conversation) {
                res.status(404).json({ success: false, message: 'Conversation not found' });
                return;
            }
            if (conversation.user1Id !== senderId && conversation.user2Id !== senderId) {
                res.status(403).json({ success: false, message: 'You are not part of this conversation' });
                return;
            }
            // Check if users are connected (for enhanced system)
            const otherUserId = conversation.user1Id === senderId ? conversation.user2Id : conversation.user1Id;
            const connection = await connection_model_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { userId1: senderId, userId2: otherUserId },
                        { userId1: otherUserId, userId2: senderId }
                    ],
                    status: 'connected'
                }
            });
            if (!connection) {
                res.status(403).json({ success: false, message: 'Users must be connected to send messages' });
                return;
            }
            // Create message
            const message = await message_model_1.default.create({
                conversationId,
                senderId,
                text,
                status: 'sent'
            });
            // Send real-time message via WebSocket (commented out for now)
            // websocketService.sendMessageToUser(otherUserId, {
            //   type: 'new_message',
            //   conversationId,
            //   message: {
            //     id: message.id,
            //     text: message.text,
            //     senderId: message.senderId,
            //     timestamp: message.createdAt
            //   }
            // });
            res.json({
                success: true,
                message: 'Message sent successfully',
                data: {
                    id: message.id,
                    text: message.text,
                    senderId: message.senderId,
                    timestamp: message.createdAt
                }
            });
        }
        catch (error) {
            console.error('❌ Error sending message:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
exports.default = new EnhancedChatController();
