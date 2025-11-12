"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Removed Sequelize imports - using Mongoose instead
const user_model_1 = __importDefault(require("../models/user.model"));
const connection_model_1 = __importDefault(require("../models/connection.model"));
const group_model_1 = __importDefault(require("../models/group.model"));
const groupMember_model_1 = __importDefault(require("../models/groupMember.model"));
const groupMessage_model_1 = __importDefault(require("../models/groupMessage.model"));
const groupMessageRead_model_1 = __importDefault(require("../models/groupMessageRead.model"));
const userImage_model_1 = __importDefault(require("../models/userImage.model"));
// Removed Sequelize db import - using MongoDB with Mongoose
const websocket_service_1 = __importDefault(require("../services/websocket.service"));
const unreadCount_service_1 = __importDefault(require("../services/unreadCount.service"));
const Op = {}; // Placeholder for legacy Sequelize operators
class GroupChatController {
    // Get user's connections for group creation
    async getConnections(req, res) {
        try {
            const userId = req.user.id;
            console.log('🔍 [GROUP] Getting connections for user ID:', userId);
            const connections = await connection_model_1.default.findAll({
                where: {
                    [Op.or]: [
                        { userId1: userId },
                        { userId2: userId }
                    ],
                    status: 'connected'
                },
                include: [
                    {
                        model: user_model_1.default,
                        as: 'connectionUser1',
                        attributes: ['id', 'name', 'username'],
                        include: [
                            {
                                model: userImage_model_1.default,
                                as: 'images',
                                attributes: ['cloudfrontUrl'],
                                required: false
                            }
                        ]
                    },
                    {
                        model: user_model_1.default,
                        as: 'connectionUser2',
                        attributes: ['id', 'name', 'username'],
                        include: [
                            {
                                model: userImage_model_1.default,
                                as: 'images',
                                attributes: ['cloudfrontUrl'],
                                required: false
                            }
                        ]
                    }
                ]
            });
            const formattedConnections = connections.map((connection) => {
                var _a, _b;
                const otherUser = connection.userId1 === userId ? connection.connectionUser2 : connection.connectionUser1;
                return {
                    id: otherUser.id,
                    name: otherUser.name || otherUser.username || 'Unknown User',
                    location: 'IIT Delhi', // TODO: Add actual location from user profile
                    avatar: ((_b = (_a = otherUser.images) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.cloudfrontUrl) || null
                };
            });
            console.log('✅ [GROUP] Returning connections:', formattedConnections.length);
            res.json({
                success: true,
                connections: formattedConnections
            });
        }
        catch (error) {
            console.error('❌ [GROUP] Error fetching connections:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch connections'
            });
        }
    }
    // Create a new group
    async createGroup(req, res) {
        // Removed Sequelize transaction usage; using direct operations
        const transaction = null;
        try {
            const userId = req.user.id;
            const { name, description, memberIds } = req.body;
            // Validation
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Group name is required'
                });
            }
            if (name.length > 255) {
                return res.status(400).json({
                    success: false,
                    message: 'Group name too long (max 255 characters)'
                });
            }
            if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one member is required'
                });
            }
            if (memberIds.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Group cannot have more than 50 members'
                });
            }
            // Verify all members are connections
            const connections = await connection_model_1.default.findAll({
                where: {
                    [Op.or]: [
                        { userId1: userId, userId2: { [Op.in]: memberIds } },
                        { userId2: userId, userId1: { [Op.in]: memberIds } }
                    ],
                    status: 'connected'
                }
            });
            if (connections.length !== memberIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'All members must be your connections'
                });
            }
            // Create group
            const group = await group_model_1.default.create({
                name: name.trim(),
                description: (description === null || description === void 0 ? void 0 : description.trim()) || null,
                createdBy: userId
            });
            // Add creator as admin
            await groupMember_model_1.default.create({
                groupId: group.id,
                userId: userId,
                isAdmin: true
            });
            // Add members
            const memberPromises = memberIds.map(memberId => groupMember_model_1.default.create({
                groupId: group.id,
                userId: memberId,
                isAdmin: false
            }));
            await Promise.all(memberPromises);
            // Get group with members
            const groupWithMembers = await group_model_1.default.findByPk(group.id, {
                include: [
                    {
                        model: groupMember_model_1.default,
                        as: 'members',
                        include: [
                            {
                                model: user_model_1.default,
                                as: 'member',
                                attributes: ['id', 'name', 'username'],
                                include: [
                                    {
                                        model: userImage_model_1.default,
                                        as: 'images',
                                        attributes: ['cloudfrontUrl'],
                                        required: false
                                    }
                                ]
                            }
                        ]
                    }
                ],
            });
            const formattedGroup = {
                id: groupWithMembers.id,
                name: groupWithMembers.name,
                description: groupWithMembers.description,
                avatar: groupWithMembers.avatarUrl,
                members: groupWithMembers.members.map((member) => {
                    var _a, _b;
                    return ({
                        id: member.member.id,
                        name: member.member.name || member.member.username || 'Unknown User',
                        location: 'IIT Delhi', // TODO: Add actual location
                        avatar: ((_b = (_a = member.member.images) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.cloudfrontUrl) || null,
                        isAdmin: member.isAdmin,
                        joinedAt: member.joinedAt
                    });
                }),
                memberCount: groupWithMembers.members.length,
                createdAt: groupWithMembers.createdAt,
                updatedAt: groupWithMembers.updatedAt,
                lastMessage: null,
                unreadCount: 0,
                isAdmin: true
            };
            // No transaction to commit
            // Notify members via WebSocket (they will receive this when they join the group)
            // The group creation notification is sent individually since users aren't in the group room yet
            memberIds.forEach(memberId => {
                if (websocket_service_1.default.isUserOnline(memberId)) {
                    websocket_service_1.default.emitToUser(memberId, 'group-created', {
                        group: formattedGroup
                    });
                }
            });
            console.log('✅ [GROUP] Group created successfully:', group.id);
            res.json({
                success: true,
                group: formattedGroup
            });
        }
        catch (error) {
            // No transaction to rollback
            console.error('❌ [GROUP] Error creating group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create group'
            });
        }
    }
    // Get user's groups
    async getGroups(req, res) {
        try {
            const userId = req.user.id;
            console.log('🔍 [GROUP] Getting groups for user ID:', userId);
            const groupMemberships = await groupMember_model_1.default.findAll({
                where: { userId },
                include: [
                    {
                        model: group_model_1.default,
                        as: 'group',
                        where: { isActive: true },
                        include: [
                            {
                                model: groupMember_model_1.default,
                                as: 'members',
                                include: [
                                    {
                                        model: user_model_1.default,
                                        as: 'member',
                                        attributes: ['id', 'name', 'username'],
                                        include: [
                                            {
                                                model: userImage_model_1.default,
                                                as: 'images',
                                                attributes: ['cloudfrontUrl'],
                                                required: false
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            const groups = await Promise.all(groupMemberships.map(async (membership) => {
                var _a, _b;
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
                // Get unread count using the unread count service
                const unreadCount = await unreadCount_service_1.default.getUnreadCount(userId, group.id, true);
                // Check if user is admin
                const userMembership = group.members.find((m) => m.userId === userId);
                const isAdmin = (userMembership === null || userMembership === void 0 ? void 0 : userMembership.isAdmin) || false;
                return {
                    id: group.id,
                    name: group.name,
                    description: group.description,
                    avatar: group.avatarUrl,
                    members: group.members.map((member) => {
                        var _a, _b;
                        return ({
                            id: member.member.id,
                            name: member.member.name || member.member.username || 'Unknown User',
                            location: 'IIT Delhi', // TODO: Add actual location
                            avatar: ((_b = (_a = member.member.images) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.cloudfrontUrl) || null,
                            isAdmin: member.isAdmin,
                            joinedAt: member.joinedAt
                        });
                    }),
                    memberCount: group.members.length,
                    createdAt: group.createdAt,
                    updatedAt: group.updatedAt,
                    lastMessage: lastMessage ? {
                        id: lastMessage.id,
                        content: lastMessage.content,
                        senderId: lastMessage.senderId,
                        senderName: ((_a = lastMessage.sender) === null || _a === void 0 ? void 0 : _a.name) || ((_b = lastMessage.sender) === null || _b === void 0 ? void 0 : _b.username) || 'Unknown User',
                        timestamp: lastMessage.createdAt
                    } : null,
                    unreadCount,
                    isAdmin
                };
            }));
            console.log('✅ [GROUP] Returning groups:', groups.length);
            res.json({
                success: true,
                groups
            });
        }
        catch (error) {
            console.error('❌ [GROUP] Error fetching groups:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch groups'
            });
        }
    }
    // Get specific group details
    async getGroup(req, res) {
        var _a, _b;
        try {
            const userId = req.user.id;
            const { groupId } = req.params;
            if (!groupId || isNaN(Number(groupId))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid group ID is required'
                });
            }
            // Check if user is member of the group
            const membership = await groupMember_model_1.default.findOne({
                where: { groupId: Number(groupId), userId }
            });
            if (!membership) {
                return res.status(404).json({
                    success: false,
                    message: 'Group not found or you are not a member'
                });
            }
            const group = await group_model_1.default.findOne({
                where: { id: Number(groupId), isActive: true },
                include: [
                    {
                        model: groupMember_model_1.default,
                        as: 'members',
                        include: [
                            {
                                model: user_model_1.default,
                                as: 'member',
                                attributes: ['id', 'name', 'username'],
                                include: [
                                    {
                                        model: userImage_model_1.default,
                                        as: 'images',
                                        attributes: ['cloudfrontUrl'],
                                        required: false
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Group not found'
                });
            }
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
            // Get unread count using the unread count service
            const unreadCount = await unreadCount_service_1.default.getUnreadCount(userId, group.id, true);
            const formattedGroup = {
                id: group.id,
                name: group.name,
                description: group.description,
                avatar: group.avatarUrl,
                members: group.members.map((member) => {
                    var _a, _b;
                    return ({
                        id: member.member.id,
                        name: member.member.name || member.member.username || 'Unknown User',
                        location: 'IIT Delhi', // TODO: Add actual location
                        avatar: ((_b = (_a = member.member.images) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.cloudfrontUrl) || null,
                        isAdmin: member.isAdmin,
                        joinedAt: member.joinedAt
                    });
                }),
                memberCount: group.members.length,
                createdAt: group.createdAt,
                updatedAt: group.updatedAt,
                lastMessage: lastMessage ? {
                    id: lastMessage.id,
                    content: lastMessage.content,
                    senderId: lastMessage.senderId,
                    senderName: ((_a = lastMessage.sender) === null || _a === void 0 ? void 0 : _a.name) || ((_b = lastMessage.sender) === null || _b === void 0 ? void 0 : _b.username) || 'Unknown User',
                    timestamp: lastMessage.createdAt
                } : null,
                unreadCount,
                isAdmin: membership.isAdmin
            };
            res.json({
                success: true,
                group: formattedGroup
            });
        }
        catch (error) {
            console.error('❌ [GROUP] Error fetching group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch group'
            });
        }
    }
    // Update group details
    async updateGroup(req, res) {
        try {
            const userId = req.user.id;
            const { groupId } = req.params;
            const { name, description, memberIds } = req.body;
            if (!groupId || isNaN(Number(groupId))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid group ID is required'
                });
            }
            // Check if user is a member of the group
            const membership = await groupMember_model_1.default.findOne({
                where: { groupId: Number(groupId), userId }
            });
            if (!membership) {
                return res.status(403).json({
                    success: false,
                    message: 'You must be a member of the group to update group details'
                });
            }
            const group = await group_model_1.default.findByPk(Number(groupId));
            if (!group || !group.isActive) {
                return res.status(404).json({
                    success: false,
                    message: 'Group not found'
                });
            }
            // Update group details
            if (name && typeof name === 'string' && name.trim().length > 0) {
                if (name.length > 255) {
                    return res.status(400).json({
                        success: false,
                        message: 'Group name too long (max 255 characters)'
                    });
                }
                group.name = name.trim();
            }
            if (description !== undefined) {
                group.description = (description === null || description === void 0 ? void 0 : description.trim()) || null;
            }
            await group.save();
            // Update members if provided
            if (memberIds && Array.isArray(memberIds)) {
                // Remove existing members (except admins)
                await groupMember_model_1.default.destroy({
                    where: {
                        groupId: Number(groupId),
                        isAdmin: false
                    }
                });
                // Add new members
                const memberPromises = memberIds.map(memberId => groupMember_model_1.default.create({
                    groupId: Number(groupId),
                    userId: memberId,
                    isAdmin: false
                }));
                await Promise.all(memberPromises);
            }
            // Get updated group with members
            const updatedGroupWithMembers = await group_model_1.default.findByPk(Number(groupId), {
                include: [
                    {
                        model: groupMember_model_1.default,
                        as: 'members',
                        include: [
                            {
                                model: user_model_1.default,
                                as: 'member',
                                attributes: ['id', 'name', 'username'],
                                include: [
                                    {
                                        model: userImage_model_1.default,
                                        as: 'images',
                                        attributes: ['cloudfrontUrl'],
                                        required: false
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            // Format the response
            const formattedGroup = {
                id: updatedGroupWithMembers.id,
                name: updatedGroupWithMembers.name,
                description: updatedGroupWithMembers.description,
                avatarUrl: updatedGroupWithMembers.avatarUrl,
                memberCount: updatedGroupWithMembers.members.length,
                members: updatedGroupWithMembers.members.map((member) => {
                    var _a, _b;
                    return ({
                        id: member.member.id,
                        name: member.member.name || member.member.username || 'Unknown User',
                        location: 'IIT Delhi', // TODO: Add actual location
                        avatar: ((_b = (_a = member.member.images) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.cloudfrontUrl) || null,
                        isAdmin: member.isAdmin,
                        joinedAt: member.joinedAt
                    });
                }),
                createdAt: updatedGroupWithMembers.createdAt,
                updatedAt: updatedGroupWithMembers.updatedAt,
                isAdmin: membership.isAdmin // Show actual admin status
            };
            // Send success response
            res.json({
                success: true,
                group: formattedGroup
            });
            // Notify group members via WebSocket
            websocket_service_1.default.emitToGroup(Number(groupId), 'group-updated', {
                groupId: Number(groupId),
                group: formattedGroup
            });
        }
        catch (error) {
            console.error('❌ [GROUP] Error updating group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update group'
            });
        }
    }
    // Delete group
    async deleteGroup(req, res) {
        try {
            const userId = req.user.id;
            const { groupId } = req.params;
            if (!groupId || isNaN(Number(groupId))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid group ID is required'
                });
            }
            // Check if user is admin of the group
            const membership = await groupMember_model_1.default.findOne({
                where: { groupId: Number(groupId), userId, isAdmin: true }
            });
            if (!membership) {
                return res.status(403).json({
                    success: false,
                    message: 'Only group admins can delete the group'
                });
            }
            const group = await group_model_1.default.findByPk(Number(groupId));
            if (!group || !group.isActive) {
                return res.status(404).json({
                    success: false,
                    message: 'Group not found'
                });
            }
            // Soft delete the group
            group.isActive = false;
            await group.save();
            // Notify group members via WebSocket
            websocket_service_1.default.emitToGroup(Number(groupId), 'group-deleted', {
                groupId: Number(groupId)
            });
            res.json({
                success: true,
                message: 'Group deleted successfully'
            });
        }
        catch (error) {
            console.error('❌ [GROUP] Error deleting group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete group'
            });
        }
    }
    // Add members to group
    async addMembers(req, res) {
        try {
            const userId = req.user.id;
            const { groupId } = req.params;
            const { memberIds } = req.body;
            if (!groupId || isNaN(Number(groupId))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid group ID is required'
                });
            }
            if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Member IDs are required'
                });
            }
            // Check if user is a member of the group
            const membership = await groupMember_model_1.default.findOne({
                where: { groupId: Number(groupId), userId }
            });
            if (!membership) {
                return res.status(403).json({
                    success: false,
                    message: 'You must be a member of the group to add members'
                });
            }
            // Check current member count
            const currentMemberCount = await groupMember_model_1.default.count({
                where: { groupId: Number(groupId) }
            });
            if (currentMemberCount + memberIds.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Group cannot have more than 50 members'
                });
            }
            // Add new members
            const memberPromises = memberIds.map(memberId => groupMember_model_1.default.create({
                groupId: Number(groupId),
                userId: memberId,
                isAdmin: false
            }));
            await Promise.all(memberPromises);
            // Notify new members via WebSocket
            memberIds.forEach(memberId => {
                if (websocket_service_1.default.isUserOnline(memberId)) {
                    websocket_service_1.default.emitToUser(memberId, 'member-added', {
                        groupId: Number(groupId)
                    });
                }
            });
            res.json({
                success: true,
                message: 'Members added successfully'
            });
        }
        catch (error) {
            console.error('❌ [GROUP] Error adding members:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add members'
            });
        }
    }
    // Remove member from group
    async removeMember(req, res) {
        try {
            const userId = req.user.id;
            const { groupId, memberId } = req.params;
            if (!groupId || isNaN(Number(groupId))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid group ID is required'
                });
            }
            if (!memberId || isNaN(Number(memberId))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid member ID is required'
                });
            }
            // Check if user is a member of the group
            const membership = await groupMember_model_1.default.findOne({
                where: { groupId: Number(groupId), userId }
            });
            if (!membership) {
                return res.status(403).json({
                    success: false,
                    message: 'You must be a member of the group to remove members'
                });
            }
            // Remove the member
            await groupMember_model_1.default.destroy({
                where: {
                    groupId: Number(groupId),
                    userId: Number(memberId)
                }
            });
            // Notify removed member via WebSocket
            if (websocket_service_1.default.isUserOnline(Number(memberId))) {
                websocket_service_1.default.emitToUser(Number(memberId), 'member-removed', {
                    groupId: Number(groupId)
                });
            }
            res.json({
                success: true,
                message: 'Member removed successfully'
            });
        }
        catch (error) {
            console.error('❌ [GROUP] Error removing member:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to remove member'
            });
        }
    }
    // Leave group
    async leaveGroup(req, res) {
        try {
            const userId = req.user.id;
            const { groupId } = req.params;
            if (!groupId || isNaN(Number(groupId))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid group ID is required'
                });
            }
            // Check if user is member of the group
            const membership = await groupMember_model_1.default.findOne({
                where: { groupId: Number(groupId), userId }
            });
            if (!membership) {
                return res.status(404).json({
                    success: false,
                    message: 'You are not a member of this group'
                });
            }
            // If user is admin, check if there are other admins
            if (membership.isAdmin) {
                const adminCount = await groupMember_model_1.default.count({
                    where: { groupId: Number(groupId), isAdmin: true }
                });
                if (adminCount === 1) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot leave group as the only admin. Please transfer admin role or delete the group.'
                    });
                }
            }
            // Remove the member
            await groupMember_model_1.default.destroy({
                where: {
                    groupId: Number(groupId),
                    userId
                }
            });
            res.json({
                success: true,
                message: 'Left group successfully'
            });
        }
        catch (error) {
            console.error('❌ [GROUP] Error leaving group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to leave group'
            });
        }
    }
    // Get group messages
    async getGroupMessages(req, res) {
        try {
            const userId = req.user.id;
            const { groupId } = req.params;
            const { limit = 50, offset = 0 } = req.query;
            if (!groupId || isNaN(Number(groupId))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid group ID is required'
                });
            }
            // Check if user is member of the group
            const membership = await groupMember_model_1.default.findOne({
                where: { groupId: Number(groupId), userId }
            });
            if (!membership) {
                return res.status(404).json({
                    success: false,
                    message: 'Group not found or you are not a member'
                });
            }
            const messages = await groupMessage_model_1.default.findAll({
                where: { groupId: Number(groupId) },
                order: [['createdAt', 'ASC']],
                limit: Number(limit),
                offset: Number(offset),
                include: [
                    {
                        model: user_model_1.default,
                        as: 'sender',
                        attributes: ['id', 'name', 'username'],
                        include: [
                            {
                                model: userImage_model_1.default,
                                as: 'images',
                                attributes: ['cloudfrontUrl'],
                                required: false
                            }
                        ]
                    }
                ]
            });
            const formattedMessages = messages.map((msg) => {
                var _a, _b, _c, _d, _e;
                return ({
                    id: msg.id,
                    groupId: msg.groupId,
                    senderId: msg.senderId,
                    senderName: ((_a = msg.sender) === null || _a === void 0 ? void 0 : _a.name) || ((_b = msg.sender) === null || _b === void 0 ? void 0 : _b.username) || 'Unknown User',
                    senderAvatar: ((_e = (_d = (_c = msg.sender) === null || _c === void 0 ? void 0 : _c.images) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.cloudfrontUrl) || null,
                    content: msg.content,
                    timestamp: msg.createdAt,
                    isEdited: msg.isEdited,
                    editedAt: msg.editedAt
                });
            });
            res.json({
                success: true,
                messages: formattedMessages
            });
        }
        catch (error) {
            console.error('❌ [GROUP] Error fetching group messages:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch group messages'
            });
        }
    }
    // Send message to group
    async sendGroupMessage(req, res) {
        var _a, _b, _c, _d, _e;
        try {
            const userId = req.user.id;
            const { groupId } = req.params;
            const { content } = req.body;
            if (!groupId || isNaN(Number(groupId))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid group ID is required'
                });
            }
            if (!content || typeof content !== 'string' || content.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Message content is required'
                });
            }
            if (content.length > 1000) {
                return res.status(400).json({
                    success: false,
                    message: 'Message too long (max 1000 characters)'
                });
            }
            // Check if user is member of the group
            const membership = await groupMember_model_1.default.findOne({
                where: { groupId: Number(groupId), userId }
            });
            if (!membership) {
                return res.status(404).json({
                    success: false,
                    message: 'Group not found or you are not a member'
                });
            }
            // Create the message
            const message = await groupMessage_model_1.default.create({
                groupId: Number(groupId),
                senderId: userId,
                content: content.trim(),
                messageType: 'text'
            });
            // Get message with sender details
            const messageWithSender = await groupMessage_model_1.default.findByPk(message.id, {
                include: [
                    {
                        model: user_model_1.default,
                        as: 'sender',
                        attributes: ['id', 'name', 'username'],
                        include: [
                            {
                                model: userImage_model_1.default,
                                as: 'images',
                                attributes: ['cloudfrontUrl'],
                                required: false
                            }
                        ]
                    }
                ]
            });
            const formattedMessage = {
                id: messageWithSender.id,
                groupId: messageWithSender.groupId,
                senderId: messageWithSender.senderId,
                senderName: ((_a = messageWithSender.sender) === null || _a === void 0 ? void 0 : _a.name) || ((_b = messageWithSender.sender) === null || _b === void 0 ? void 0 : _b.username) || 'Unknown User',
                senderAvatar: ((_e = (_d = (_c = messageWithSender.sender) === null || _c === void 0 ? void 0 : _c.images) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.cloudfrontUrl) || null,
                content: messageWithSender.content,
                timestamp: messageWithSender.createdAt,
                isEdited: messageWithSender.isEdited,
                editedAt: messageWithSender.editedAt
            };
            // Get all group members
            const groupMembers = await groupMember_model_1.default.findAll({
                where: { groupId: Number(groupId) }
            });
            // Emit to all group members via group room
            console.log(`📡 [GROUP] Emitting group-message to group ${groupId}`);
            console.log(`📡 [GROUP] Message data:`, {
                groupId: Number(groupId),
                message: formattedMessage
            });
            websocket_service_1.default.emitToGroup(Number(groupId), 'group-message', {
                groupId: Number(groupId),
                message: formattedMessage
            });
            console.log(`✅ [GROUP] Group message emitted successfully`);
            // Update unread counts for all group members except sender
            await unreadCount_service_1.default.updateGroupUnreadCounts(Number(groupId), userId, message.id);
            res.json({
                success: true,
                message: formattedMessage
            });
        }
        catch (error) {
            console.error('❌ [GROUP] Error sending group message:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send message'
            });
        }
    }
    // Mark group messages as read
    async markGroupMessagesAsRead(req, res) {
        try {
            const userId = req.user.id;
            const { groupId } = req.params;
            console.log(`📖 [GROUP] Marking messages as read for user ${userId} in group ${groupId}`);
            if (!groupId || isNaN(Number(groupId))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid group ID is required'
                });
            }
            // Check if user is member of the group
            const membership = await groupMember_model_1.default.findOne({
                where: { groupId: Number(groupId), userId }
            });
            if (!membership) {
                return res.status(404).json({
                    success: false,
                    message: 'Group not found or you are not a member'
                });
            }
            // Get all messages in the group that the user hasn't read
            const unreadMessages = await groupMessage_model_1.default.findAll({
                where: {
                    groupId: Number(groupId),
                    senderId: { [Op.ne]: userId } // Messages not sent by the user
                },
                include: [
                    {
                        model: groupMessageRead_model_1.default,
                        as: 'readStatuses',
                        where: { userId },
                        required: false
                    }
                ]
            });
            // Filter out messages that are already read
            const actuallyUnreadMessages = unreadMessages.filter((message) => !message.readStatuses || message.readStatuses.length === 0);
            console.log(`📖 [GROUP] Found ${actuallyUnreadMessages.length} unread messages`);
            // Mark messages as read
            if (actuallyUnreadMessages.length > 0) {
                const readPromises = actuallyUnreadMessages.map((message) => groupMessageRead_model_1.default.findOrCreate({
                    where: {
                        messageId: message.id,
                        userId
                    },
                    defaults: {
                        messageId: message.id,
                        userId,
                        readAt: new Date()
                    }
                }));
                await Promise.all(readPromises);
                console.log(`✅ [GROUP] Marked ${actuallyUnreadMessages.length} messages as read`);
            }
            // Reset unread count for this user in this group
            await unreadCount_service_1.default.resetUnreadCount(userId, Number(groupId), true);
            res.json({
                success: true,
                message: `Marked ${actuallyUnreadMessages.length} messages as read`
            });
        }
        catch (error) {
            console.error('❌ [GROUP] Error marking messages as read:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark messages as read'
            });
        }
    }
}
exports.default = new GroupChatController();
