"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationAsRead = exports.handleConnectionRequest = exports.getNotifications = void 0;
const sequelize_1 = require("sequelize");
const user_model_1 = __importDefault(require("../models/user.model"));
const userImage_model_1 = __importDefault(require("../models/userImage.model"));
const connectionRequest_model_1 = __importDefault(require("../models/connectionRequest.model"));
const match_model_1 = __importDefault(require("../models/match.model"));
const connection_model_1 = __importDefault(require("../models/connection.model"));
const notificationReadStatus_model_1 = __importDefault(require("../models/notificationReadStatus.model"));
const university_model_1 = __importDefault(require("../models/university.model"));
// Utility function to calculate time ago
function calculateTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
    }
    else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}
// Get all notifications for a user
const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                errorCode: 'UNAUTHORIZED'
            });
        }
        // Get connection requests
        const connectionRequests = await connectionRequest_model_1.default.findAll({
            where: {
                targetId: userId,
                status: 'pending'
            },
            include: [
                {
                    model: user_model_1.default,
                    as: 'requester',
                    include: [
                        {
                            model: university_model_1.default,
                            as: 'userUniversity'
                        },
                        {
                            model: userImage_model_1.default,
                            as: 'images',
                            attributes: ['cloudfrontUrl'],
                            required: false
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        // Get adjective notifications (from Match table)
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
            ],
            order: [['matchTimestamp', 'DESC']]
        });
        // Group matches by mutual adjective
        const matchGroups = new Map();
        matches.forEach(match => {
            if (!matchGroups.has(match.mutualAdjective)) {
                matchGroups.set(match.mutualAdjective, []);
            }
            matchGroups.get(match.mutualAdjective).push(match);
        });
        // Format connection requests
        const formattedConnectionRequests = connectionRequests.map(request => ({
            id: request.id,
            requesterId: request.requesterId,
            requesterName: request.requester?.name || 'Unknown User',
            requesterLocation: request.requester?.userUniversity?.name || 'Unknown University',
            requesterProfileImage: request.requester?.images?.[0]?.cloudfrontUrl || null,
            status: request.status,
            createdAt: request.createdAt
        }));
        // Format adjective notifications
        const formattedAdjectiveNotifications = Array.from(matchGroups.entries()).map(([mutualAdjective, matches]) => {
            const latestMatch = matches[0];
            // Get the other user for each match
            const otherUsers = matches.map(match => {
                const otherUser = match.userId1 === userId ? match.matchUser2 : match.matchUser1;
                return {
                    id: otherUser.id,
                    name: otherUser.name || otherUser.username || 'Unknown User',
                    profileImage: null // We'll need to add image logic if needed
                };
            });
            return {
                id: latestMatch.id,
                adjective: mutualAdjective,
                count: matches.length,
                userIds: otherUsers.map(u => u.id),
                userNames: otherUsers.map(u => u.name),
                userProfileImages: otherUsers.map(u => u.profileImage),
                timeAgo: calculateTimeAgo(latestMatch.matchTimestamp),
                createdAt: latestMatch.matchTimestamp,
                isConnected: latestMatch.isConnected,
                iceBreakingPrompt: latestMatch.iceBreakingPrompt
            };
        });
        res.json({
            success: true,
            connectionRequests: formattedConnectionRequests,
            adjectiveNotifications: formattedAdjectiveNotifications,
            requestCount: formattedConnectionRequests.length
        });
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: 'INTERNAL_ERROR'
        });
    }
};
exports.getNotifications = getNotifications;
// Handle connection request (accept/reject)
const handleConnectionRequest = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { requestId, action } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                errorCode: 'UNAUTHORIZED'
            });
        }
        if (!requestId || !action) {
            return res.status(400).json({
                success: false,
                message: 'Request ID and action are required',
                errorCode: 'MISSING_PARAMETERS'
            });
        }
        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be "accept" or "reject"',
                errorCode: 'INVALID_ACTION'
            });
        }
        // Find the connection request
        const connectionRequest = await connectionRequest_model_1.default.findOne({
            where: {
                id: requestId,
                targetId: userId,
                status: 'pending'
            },
            include: [
                {
                    model: user_model_1.default,
                    as: 'requester'
                }
            ]
        });
        if (!connectionRequest) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
                errorCode: 'REQUEST_NOT_FOUND'
            });
        }
        // Update the request status
        const newStatus = action === 'accept' ? 'accepted' : 'rejected';
        await connectionRequest.update({ status: newStatus });
        let connectionState = null;
        if (action === 'accept') {
            // Create or update connection
            const [connection, created] = await connection_model_1.default.findOrCreate({
                where: {
                    [sequelize_1.Op.or]: [
                        { userId1: connectionRequest.requesterId, userId2: userId },
                        { userId1: userId, userId2: connectionRequest.requesterId }
                    ]
                },
                defaults: {
                    userId1: connectionRequest.requesterId,
                    userId2: userId,
                    status: 'connected'
                }
            });
            if (!created) {
                await connection.update({ status: 'connected' });
            }
            connectionState = {
                id: connection.id,
                userId1: connection.userId1,
                userId2: connection.userId2,
                status: connection.status,
                createdAt: connection.createdAt,
                updatedAt: connection.updatedAt
            };
        }
        res.json({
            success: true,
            message: `Request ${action}ed successfully`,
            connectionState
        });
    }
    catch (error) {
        console.error('Error handling connection request:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: 'INTERNAL_ERROR'
        });
    }
};
exports.handleConnectionRequest = handleConnectionRequest;
// Mark notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { notificationId } = req.params;
        const { notificationType } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                errorCode: 'UNAUTHORIZED'
            });
        }
        if (!notificationId || !notificationType) {
            return res.status(400).json({
                success: false,
                message: 'Notification ID and type are required',
                errorCode: 'MISSING_PARAMETERS'
            });
        }
        if (!['connection_request', 'adjective_notification'].includes(notificationType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notification type',
                errorCode: 'INVALID_NOTIFICATION_TYPE'
            });
        }
        // Create or update read status
        await notificationReadStatus_model_1.default.upsert({
            userId,
            notificationId: parseInt(notificationId),
            notificationType,
            isRead: true,
            readAt: new Date()
        });
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: 'INTERNAL_ERROR'
        });
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
