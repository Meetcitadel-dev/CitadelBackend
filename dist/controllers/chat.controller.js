"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const user_model_1 = __importDefault(require("../models/user.model"));
const connection_model_1 = __importDefault(require("../models/connection.model"));
const match_model_1 = __importDefault(require("../models/match.model"));
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const group_model_1 = __importDefault(require("../models/group.model"));
const groupMember_model_1 = __importDefault(require("../models/groupMember.model"));
const groupMessage_model_1 = __importDefault(require("../models/groupMessage.model"));
const websocket_service_1 = __importDefault(require("../services/websocket.service"));
const userImage_model_1 = __importDefault(require("../models/userImage.model"));
class ChatController {
    // Get active conversations (connected users and groups)
    async getActiveConversations(req, res) {
        try {
            const userId = req.user.id;
            console.log('🔍 [ACTIVE] Looking for active conversations for user ID:', userId);
            // Get all connected users
            const connections = await connection_model_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { userId1: userId },
                        { userId2: userId }
                    ],
                    status: 'connected'
                },
                include: [
                    {
                        model: user_model_1.default,
                        as: 'connectionUser1',
                        attributes: ['id', 'name', 'username']
                    },
                    {
                        model: user_model_1.default,
                        as: 'connectionUser2',
                        attributes: ['id', 'name', 'username']
                    }
                ]
            });
            console.log('🔗 [ACTIVE] Found connections:', connections.length);
            const conversations = await Promise.all(connections.map(async (connection) => {
                // Fix: Get the OTHER user, not the same user
                const otherUser = connection.userId1 === userId ? connection.connectionUser2 : connection.connectionUser1;
                console.log(`👤 [ACTIVE] Other user: ${otherUser.name} (ID: ${otherUser.id})`);
                const conversation = await conversation_model_1.default.findOne({
                    where: {
                        [sequelize_1.Op.or]: [
                            { user1Id: userId, user2Id: otherUser.id },
                            { user1Id: otherUser.id, user2Id: userId }
                        ]
                    }
                });
                console.log(`💬 [ACTIVE] Conversation found:`, conversation ? conversation.id : 'NOT FOUND');
                // Get last message (simplified)
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
                // Get unread count (simplified)
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
                return {
                    id: conversation?.id || null,
                    userId: otherUser.id,
                    name: otherUser.name || otherUser.username || 'Unknown User',
                    profileImage: null,
                    lastMessage,
                    lastMessageTime,
                    isOnline: false, // Simplified for now
                    unreadCount,
                    type: 'individual'
                };
            }));
            // Get user's groups
            const groupMemberships = await groupMember_model_1.default.findAll({
                where: { userId },
                include: [
                    {
                        model: group_model_1.default,
                        as: 'group',
                        where: { isActive: true }
                    }
                ]
            });
            console.log('👥 [ACTIVE] Found groups:', groupMemberships.length);
            const groupConversations = await Promise.all(groupMemberships.map(async (membership) => {
                const group = membership.group;
                // Get last message
                const lastMessage = await groupMessage_model_1.default.findOne({
                    where: { groupId: group.id },
                    order: [['createdAt', 'DESC']],
                    include: [
                        {
                            model: user_model_1.default,
                            as: 'sender',
                            attributes: ['id', 'name', 'username']
                        }
                    ]
                });
                // Get unread count
                const unreadCount = await groupMessage_model_1.default.count({
                    where: {
                        groupId: group.id,
                        senderId: { [sequelize_1.Op.ne]: userId },
                        id: {
                            [sequelize_1.Op.notIn]: db_1.default.literal(`(
                  SELECT "messageId" FROM "group_message_reads" 
                  WHERE "userId" = ${userId}
                )`)
                        }
                    }
                });
                return {
                    id: `group_${group.id}`,
                    groupId: group.id,
                    name: group.name,
                    profileImage: group.avatarUrl,
                    lastMessage: lastMessage ? lastMessage.content : null,
                    lastMessageTime: lastMessage ? lastMessage.createdAt : null,
                    isOnline: false,
                    unreadCount,
                    type: 'group',
                    memberCount: await groupMember_model_1.default.count({ where: { groupId: group.id } })
                };
            }));
            const allConversations = [...conversations.filter((conv) => conv.id !== null), ...groupConversations];
            // Sort by last message time (most recent first)
            allConversations.sort((a, b) => {
                const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
                const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
                return timeB - timeA;
            });
            console.log('✅ [ACTIVE] Returning all conversations:', allConversations.length);
            res.json({
                success: true,
                conversations: allConversations
            });
        }
        catch (error) {
            console.error('❌ [ACTIVE] Error fetching active conversations:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch active conversations'
            });
        }
    }
    // Get matched conversations (matched users)
    async getMatchedConversations(req, res) {
        try {
            const userId = req.user.id;
            console.log('🔍 [MATCHES] Looking for matched conversations for user ID:', userId);
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
            console.log('💕 [MATCHES] Found matches:', matches.length);
            const conversations = await Promise.all(matches.map(async (match) => {
                // Fix: Get the OTHER user, not the same user
                const otherUser = match.userId1 === userId ? match.matchUser2 : match.matchUser1;
                console.log(`👤 [MATCHES] Other user: ${otherUser.name} (ID: ${otherUser.id})`);
                const conversation = await conversation_model_1.default.findOne({
                    where: {
                        [sequelize_1.Op.or]: [
                            { user1Id: userId, user2Id: otherUser.id },
                            { user1Id: otherUser.id, user2Id: userId }
                        ]
                    }
                });
                console.log(`💬 [MATCHES] Conversation found:`, conversation ? conversation.id : 'NOT FOUND');
                // Get last message (simplified)
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
                // Get unread count (simplified)
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
                return {
                    id: conversation?.id || null,
                    userId: otherUser.id,
                    name: otherUser.name || otherUser.username || 'Unknown User',
                    profileImage: null,
                    lastMessage,
                    lastMessageTime,
                    isOnline: false, // Simplified for now
                    unreadCount
                };
            }));
            const filteredConversations = conversations.filter((conv) => conv.id !== null);
            console.log('✅ [MATCHES] Returning filtered conversations:', filteredConversations.length);
            res.json({
                success: true,
                conversations: filteredConversations
            });
        }
        catch (error) {
            console.error('❌ [MATCHES] Error fetching matched conversations:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch matched conversations'
            });
        }
    }
    // Get conversation messages
    async getConversationMessages(req, res) {
        try {
            const userId = req.user.id;
            const { conversationId } = req.params;
            // Verify user has access to this conversation
            const conversation = await conversation_model_1.default.findOne({
                where: {
                    id: conversationId,
                    [sequelize_1.Op.or]: [
                        { user1Id: userId },
                        { user2Id: userId }
                    ]
                }
            });
            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: 'Conversation not found'
                });
            }
            const messages = await message_model_1.default.findAll({
                where: { conversationId },
                order: [['createdAt', 'ASC']],
                include: [
                    {
                        model: user_model_1.default,
                        as: 'messageSender',
                        attributes: ['id', 'name', 'username']
                    }
                ]
            });
            const formattedMessages = messages.map(msg => ({
                id: msg.id,
                text: msg.text,
                isSent: msg.senderId === userId,
                timestamp: msg.createdAt,
                status: msg.status,
                sender: {
                    id: msg.messageSender?.id,
                    name: msg.messageSender?.name || msg.messageSender?.username || 'Unknown User'
                }
            }));
            res.json({
                success: true,
                messages: formattedMessages
            });
        }
        catch (error) {
            console.error('Error fetching conversation messages:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch conversation messages'
            });
        }
    }
    // Send message
    async sendMessage(req, res) {
        try {
            const userId = req.user.id;
            const { conversationId } = req.params;
            const { message } = req.body;
            if (!message || typeof message !== 'string' || message.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Message is required'
                });
            }
            if (message.length > 1000) {
                return res.status(400).json({
                    success: false,
                    message: 'Message too long (max 1000 characters)'
                });
            }
            // Verify user has access to this conversation
            const conversation = await conversation_model_1.default.findOne({
                where: {
                    id: conversationId,
                    [sequelize_1.Op.or]: [
                        { user1Id: userId },
                        { user2Id: userId }
                    ]
                }
            });
            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: 'Conversation not found'
                });
            }
            // Create the message in database
            const newMessage = await message_model_1.default.create({
                conversationId,
                senderId: userId,
                text: message.trim(),
                status: 'sent'
            });
            // Update conversation updatedAt
            await conversation.update({ updatedAt: new Date() });
            // Get the other user in the conversation
            const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
            // Emit real-time message to recipient if online
            console.log(`📡 Chat Controller - Checking if user ${otherUserId} is online...`);
            if (websocket_service_1.default.isUserOnline(otherUserId)) {
                console.log(`✅ Chat Controller - User ${otherUserId} is online, emitting new_message`);
                websocket_service_1.default.emitToUser(otherUserId, 'new_message', {
                    conversationId,
                    message: {
                        id: newMessage.id,
                        text: newMessage.text,
                        senderId: newMessage.senderId,
                        timestamp: newMessage.createdAt,
                        status: newMessage.status
                    }
                });
            }
            else {
                console.log(`❌ Chat Controller - User ${otherUserId} is not online`);
            }
            // Emit confirmation to sender
            if (websocket_service_1.default.isUserOnline(userId)) {
                websocket_service_1.default.emitToUser(userId, 'message_sent', {
                    messageId: newMessage.id,
                    conversationId,
                    message: newMessage.text,
                    timestamp: newMessage.createdAt,
                    status: newMessage.status
                });
            }
            res.json({
                success: true,
                message: {
                    id: newMessage.id,
                    text: newMessage.text,
                    timestamp: newMessage.createdAt,
                    status: newMessage.status
                }
            });
        }
        catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send message'
            });
        }
    }
    // Mark messages as read
    async markAsRead(req, res) {
        try {
            const userId = req.user.id;
            const { conversationId } = req.params;
            // Verify user has access to this conversation
            const conversation = await conversation_model_1.default.findOne({
                where: {
                    id: conversationId,
                    [sequelize_1.Op.or]: [
                        { user1Id: userId },
                        { user2Id: userId }
                    ]
                }
            });
            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: 'Conversation not found'
                });
            }
            // Mark all messages from other user as read
            const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
            await message_model_1.default.update({ status: 'read' }, {
                where: {
                    conversationId,
                    senderId: otherUserId,
                    status: { [sequelize_1.Op.ne]: 'read' }
                }
            });
            // Notify sender that messages were read (real-time)
            if (websocket_service_1.default.isUserOnline(otherUserId)) {
                websocket_service_1.default.emitToUser(otherUserId, 'messages_read', {
                    conversationId,
                    readBy: userId
                });
            }
            res.json({
                success: true
            });
        }
        catch (error) {
            console.error('Error marking messages as read:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark messages as read'
            });
        }
    }
    // Get or create conversation by user ID
    async getConversationByUserId(req, res) {
        try {
            const userId = req.user.id;
            const { targetUserId } = req.params;
            if (!targetUserId || isNaN(Number(targetUserId))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid user ID is required'
                });
            }
            const targetUser = await user_model_1.default.findByPk(targetUserId, {
                attributes: ['id', 'name', 'username']
            });
            if (!targetUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            // Check if conversation already exists
            let conversation = await conversation_model_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { user1Id: userId, user2Id: targetUserId },
                        { user1Id: targetUserId, user2Id: userId }
                    ]
                }
            });
            // If conversation doesn't exist, create it
            if (!conversation) {
                conversation = await conversation_model_1.default.create({
                    user1Id: Math.min(userId, Number(targetUserId)),
                    user2Id: Math.max(userId, Number(targetUserId))
                });
            }
            res.json({
                success: true,
                conversation: {
                    id: conversation.id,
                    userId: targetUser.id,
                    name: targetUser.name || targetUser.username || 'Unknown User',
                    profileImage: null // TODO: Add profile image support
                }
            });
        }
        catch (error) {
            console.error('Error getting conversation by user ID:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get conversation'
            });
        }
    }
    // Get conversation details by conversation ID
    async getConversationDetails(req, res) {
        try {
            const userId = req.user.id;
            const { conversationId } = req.params;
            if (!conversationId) {
                return res.status(400).json({
                    success: false,
                    message: 'Conversation ID is required'
                });
            }
            // Find the conversation and verify user has access
            const conversation = await conversation_model_1.default.findOne({
                where: {
                    id: conversationId,
                    [sequelize_1.Op.or]: [
                        { user1Id: userId },
                        { user2Id: userId }
                    ]
                }
            });
            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: 'Conversation not found'
                });
            }
            // Get the other user's ID
            const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
            // Get the other user's details
            const otherUser = await user_model_1.default.findByPk(otherUserId, {
                attributes: ['id', 'name', 'username'],
                include: [
                    {
                        model: userImage_model_1.default,
                        as: 'images',
                        attributes: ['cloudfrontUrl'],
                        required: false
                    }
                ]
            });
            if (!otherUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            res.json({
                success: true,
                conversation: {
                    id: conversation.id,
                    userId: otherUser.id,
                    name: otherUser.name || otherUser.username || 'Unknown User',
                    profileImage: otherUser.images?.[0]?.cloudfrontUrl || null
                }
            });
        }
        catch (error) {
            console.error('Error getting conversation details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get conversation details'
            });
        }
    }
}
exports.default = new ChatController();
