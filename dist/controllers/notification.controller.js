"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationAsRead = exports.handleConnectionRequest = exports.getNotifications = void 0;
const sequelize_1 = require("sequelize");
const user_model_1 = __importDefault(require("../models/user.model"));
const userImage_model_1 = __importDefault(require("../models/userImage.model"));
const userImageSlot_model_1 = __importDefault(require("../models/userImageSlot.model"));
const connectionRequest_model_1 = __importDefault(require("../models/connectionRequest.model"));
const match_model_1 = __importDefault(require("../models/match.model"));
const connection_model_1 = __importDefault(require("../models/connection.model"));
const notificationReadStatus_model_1 = __importDefault(require("../models/notificationReadStatus.model"));
const university_model_1 = __importDefault(require("../models/university.model"));
const s3_service_1 = require("../services/s3.service");
const websocket_service_1 = __importDefault(require("../services/websocket.service"));
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
// Helper: get profile image URL from slot[0]
async function getSlot0ImageUrl(userId) {
    try {
        const mapping = await userImageSlot_model_1.default.findOne({ where: { userId, slot: 0 } });
        if (!mapping)
            return null;
        const img = await userImage_model_1.default.findByPk(mapping.userImageId);
        if (!img)
            return null;
        const useUT = process.env.USE_UPLOADTHING === 'true';
        const isUploadThing = typeof img.cloudfrontUrl === 'string' && img.cloudfrontUrl.includes('utfs.io');
        if (isUploadThing || useUT) {
            return img.cloudfrontUrl;
        }
        try {
            return (0, s3_service_1.generateCloudFrontSignedUrl)(img.s3Key);
        }
        catch (error) {
            return (0, s3_service_1.generateS3SignedUrl)(img.s3Key);
        }
    }
    catch (e) {
        console.warn('Failed to get slot[0] image for user', userId, e);
        return null;
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
        // Format connection requests with slot[0] profile image
        const formattedConnectionRequests = await Promise.all(connectionRequests.map(async (request) => ({
            id: request.id,
            requesterId: request.requesterId,
            requesterName: request.requester?.name || 'Unknown User',
            requesterLocation: request.requester?.userUniversity?.name || 'Unknown University',
            requesterProfileImage: await getSlot0ImageUrl(request.requesterId),
            status: request.status,
            createdAt: request.createdAt
        })));
        // Format adjective notifications with slot[0] profile images for other users
        const formattedAdjectiveNotifications = await Promise.all(Array.from(matchGroups.entries()).map(async ([mutualAdjective, groupMatches]) => {
            const latestMatch = groupMatches[0];
            // Determine other users and load their slot[0] images
            const otherUsers = await Promise.all(groupMatches.map(async (match) => {
                const otherUser = match.userId1 === userId ? match.matchUser2 : match.matchUser1;
                const profileImage = await getSlot0ImageUrl(otherUser.id);
                return {
                    id: otherUser.id,
                    name: otherUser.name || otherUser.username || 'Unknown User',
                    profileImage
                };
            }));
            return {
                id: latestMatch.id,
                adjective: mutualAdjective,
                count: groupMatches.length,
                userIds: otherUsers.map(u => u.id),
                userNames: otherUsers.map(u => u.name),
                userProfileImages: otherUsers.map(u => u.profileImage),
                timeAgo: calculateTimeAgo(latestMatch.matchTimestamp),
                createdAt: latestMatch.matchTimestamp,
                isConnected: latestMatch.isConnected,
                iceBreakingPrompt: latestMatch.iceBreakingPrompt
            };
        }));
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
            // Get accepter details for the notification
            const accepter = await user_model_1.default.findByPk(userId, {
                attributes: ['id', 'name', 'username'],
                include: [
                    {
                        model: userImageSlot_model_1.default,
                        as: 'imageSlots',
                        where: { slot: 0 },
                        required: false,
                        include: [
                            {
                                model: userImage_model_1.default,
                                as: 'image'
                            }
                        ]
                    }
                ]
            });
            // Emit real-time connection accepted to requester
            const accepterImageUrl = await getSlot0ImageUrl(userId);
            const acceptData = {
                connectionId: connection.id,
                accepterId: userId,
                accepterName: accepter?.name || 'Unknown User',
                accepterUsername: accepter?.username,
                accepterImage: accepterImageUrl,
                requestId: connectionRequest.id,
                status: 'connected',
                message: `${accepter?.name || 'Someone'} accepted your connection request`
            };
            websocket_service_1.default.emitConnectionRequestAccepted(connectionRequest.requesterId, acceptData);
            console.log(`✅ Connection request accepted by ${userId} for requester ${connectionRequest.requesterId}`);
        }
        else {
            // Get rejecter details for the notification
            const rejecter = await user_model_1.default.findByPk(userId, {
                attributes: ['id', 'name', 'username']
            });
            // Emit real-time connection rejected to requester
            const rejectData = {
                requestId: connectionRequest.id,
                rejecterId: userId,
                rejecterName: rejecter?.name || 'Unknown User',
                status: 'rejected',
                message: `Your connection request was declined`
            };
            websocket_service_1.default.emitConnectionRequestRejected(connectionRequest.requesterId, rejectData);
            console.log(`❌ Connection request rejected by ${userId} for requester ${connectionRequest.requesterId}`);
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
