"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUsername = exports.generateUsername = exports.getMutualFriends = exports.getUserProfileByUsername = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const userImage_model_1 = __importDefault(require("../models/userImage.model"));
const userImageSlot_model_1 = __importDefault(require("../models/userImageSlot.model"));
const university_model_1 = __importDefault(require("../models/university.model"));
const connection_model_1 = __importDefault(require("../models/connection.model"));
const connectionRequest_model_1 = __importDefault(require("../models/connectionRequest.model"));
const s3_service_1 = require("../services/s3.service");
const sequelize_1 = require("sequelize");
// Get user profile by username
const getUserProfileByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const currentUserId = req.user?.id;
        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username is required'
            });
        }
        // Find user by username
        const user = await user_model_1.default.findOne({
            where: { username },
            include: [
                {
                    model: university_model_1.default,
                    as: 'userUniversity'
                }
            ]
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Check if user is viewing their own profile
        const isOwnProfile = currentUserId === user.id;
        // Fetch slot mappings and resolve images in slot order (0..4)
        const slotMappings = await userImageSlot_model_1.default.findAll({
            where: { userId: user.id },
            order: [['slot', 'ASC']],
        });
        const slotToImageId = new Map();
        for (const m of slotMappings) {
            slotToImageId.set(m.slot, m.userImageId);
        }
        // Prefetch all images referenced by slots
        const referencedIds = Array.from(slotToImageId.values());
        const referencedImages = referencedIds.length
            ? await userImage_model_1.default.findAll({ where: { id: referencedIds } })
            : [];
        const idToImage = new Map();
        for (const img of referencedImages)
            idToImage.set(img.id, img);
        // For library or fallback (optional): still fetch recent images
        const recentImages = await userImage_model_1.default.findAll({
            where: { userId: user.id },
            order: [['createdAt', 'DESC']],
            limit: 20,
        });
        const useUT = process.env.USE_UPLOADTHING === 'true';
        const freshen = async (img) => {
            const isUploadThing = typeof img.cloudfrontUrl === 'string' && img.cloudfrontUrl.includes('utfs.io');
            if (isUploadThing || useUT) {
                return {
                    id: img.id,
                    cloudfrontUrl: img.cloudfrontUrl,
                    originalName: img.originalName,
                    mimeType: img.mimeType,
                    fileSize: img.fileSize,
                    createdAt: img.createdAt
                };
            }
            let freshUrl;
            try {
                freshUrl = (0, s3_service_1.generateCloudFrontSignedUrl)(img.s3Key);
            }
            catch (error) {
                console.warn('CloudFront signing failed for image', img.id, 'using S3 signed URL as fallback:', error);
                freshUrl = (0, s3_service_1.generateS3SignedUrl)(img.s3Key);
            }
            return {
                id: img.id,
                cloudfrontUrl: freshUrl,
                originalName: img.originalName,
                mimeType: img.mimeType,
                fileSize: img.fileSize,
                createdAt: img.createdAt
            };
        };
        // Build slots array length 5
        const slots = await Promise.all(Array.from({ length: 5 }, async (_, i) => {
            const imageId = slotToImageId.get(i);
            if (!imageId)
                return { slot: i, image: null };
            const img = idToImage.get(imageId);
            if (!img)
                return { slot: i, image: null };
            const payload = await freshen(img);
            return { slot: i, image: payload };
        }));
        const imagesWithFreshUrls = await Promise.all(recentImages.map((img) => freshen(img)));
        // Get connection state between current user and target user
        let connectionState = null;
        if (!isOwnProfile) {
            const connection = await connection_model_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { userId1: currentUserId, userId2: user.id },
                        { userId1: user.id, userId2: currentUserId }
                    ]
                }
            });
            if (connection) {
                connectionState = {
                    id: connection.id,
                    status: connection.status,
                    requesterId: connection.userId1,
                    targetId: connection.userId2,
                    createdAt: connection.createdAt,
                    updatedAt: connection.updatedAt
                };
            }
            else {
                // Check for pending connection requests
                const request = await connectionRequest_model_1.default.findOne({
                    where: {
                        [sequelize_1.Op.or]: [
                            { requesterId: currentUserId, targetId: user.id },
                            { requesterId: user.id, targetId: currentUserId }
                        ]
                    }
                });
                if (request) {
                    connectionState = {
                        id: request.id,
                        status: request.status === 'pending' ? 'requested' : (request.status === 'accepted' ? 'connected' : request.status),
                        requesterId: request.requesterId,
                        targetId: request.targetId,
                        createdAt: request.createdAt,
                        updatedAt: request.updatedAt
                    };
                }
            }
        }
        // Get connections count for the target user
        const connectionsCount = await connection_model_1.default.count({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: user.id, status: 'connected' },
                    { userId2: user.id, status: 'connected' }
                ]
            }
        });
        // Get mutual connections count if not own profile
        let mutualConnectionsCount = 0;
        if (!isOwnProfile) {
            const currentUserConnections = await connection_model_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { userId1: currentUserId, status: 'connected' },
                        { userId2: currentUserId, status: 'connected' }
                    ]
                }
            });
            const targetUserConnections = await connection_model_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { userId1: user.id, status: 'connected' },
                        { userId2: user.id, status: 'connected' }
                    ]
                }
            });
            const currentUserConnectionIds = currentUserConnections.map(conn => conn.userId1 === currentUserId ? conn.userId2 : conn.userId1);
            const targetUserConnectionIds = targetUserConnections.map(conn => conn.userId1 === user.id ? conn.userId2 : conn.userId1);
            // Find intersection
            const mutualConnectionIds = currentUserConnectionIds.filter(id => targetUserConnectionIds.includes(id));
            mutualConnectionsCount = mutualConnectionIds.length;
        }
        // Get actual connections for the target user
        const userConnections = await connection_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: user.id, status: 'connected' },
                    { userId2: user.id, status: 'connected' }
                ]
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
        // Format connections data
        const connections = userConnections.map(conn => {
            const isUser1 = conn.userId1 === user.id;
            const connectedUser = isUser1 ? conn.userId2 : conn.userId1;
            const connectedUserData = isUser1 ? conn.connectionUser2 : conn.connectionUser1;
            return {
                id: connectedUser,
                name: connectedUserData?.name || 'Unknown User'
            };
        });
        // Prepare profile data
        const profileData = {
            id: user.id,
            name: user.name,
            username: user.username,
            email: isOwnProfile ? user.email : undefined, // Hide email for other users
            university: user.userUniversity ? {
                id: user.userUniversity.id,
                name: user.userUniversity.name,
                domain: user.userUniversity.domain,
                country: user.userUniversity.country
            } : null,
            degree: user.degree,
            year: user.year,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : null,
            skills: Array.isArray(user.skills) ? user.skills : [],
            aboutMe: user.aboutMe,
            sports: user.sports,
            movies: user.movies,
            tvShows: user.tvShows,
            teams: user.teams,
            portfolioLink: user.portfolioLink,
            phoneNumber: isOwnProfile ? user.phoneNumber : undefined, // Hide phone for other users
            connections: connections,
            connectionsCount,
            mutualConnectionsCount,
            isProfileComplete: user.isProfileComplete,
            isEmailVerified: isOwnProfile ? user.isEmailVerified : undefined,
            images: imagesWithFreshUrls,
            slots,
            connectionState,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: profileData
        });
    }
    catch (error) {
        console.error('Error retrieving user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile'
        });
    }
};
exports.getUserProfileByUsername = getUserProfileByUsername;
// Get mutual friends list
const getMutualFriends = async (req, res) => {
    try {
        const { username } = req.params;
        const currentUserId = req.user?.id;
        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username is required'
            });
        }
        // Find target user
        const targetUser = await user_model_1.default.findOne({
            where: { username }
        });
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Get current user's connections
        const currentUserConnections = await connection_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: currentUserId, status: 'connected' },
                    { userId2: currentUserId, status: 'connected' }
                ]
            }
        });
        // Get target user's connections
        const targetUserConnections = await connection_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: targetUser.id, status: 'connected' },
                    { userId2: targetUser.id, status: 'connected' }
                ]
            }
        });
        const currentUserFriendIds = currentUserConnections.map(conn => conn.userId1 === currentUserId ? conn.userId2 : conn.userId1);
        const targetUserFriendIds = targetUserConnections.map(conn => conn.userId1 === targetUser.id ? conn.userId2 : conn.userId1);
        // Find intersection
        const mutualFriendIds = currentUserFriendIds.filter(id => targetUserFriendIds.includes(id));
        // Get mutual friends details
        const mutualFriends = await user_model_1.default.findAll({
            where: {
                id: {
                    [sequelize_1.Op.in]: mutualFriendIds
                }
            },
            attributes: ['id', 'name', 'username'],
            include: [
                {
                    model: userImage_model_1.default,
                    as: 'images',
                    attributes: ['cloudfrontUrl'],
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                }
            ]
        });
        const formattedMutualFriends = mutualFriends.map(friend => ({
            id: friend.id,
            name: friend.name,
            username: friend.username,
            profileImage: friend.images && friend.images.length > 0
                ? friend.images[0].cloudfrontUrl
                : null
        }));
        res.json({
            success: true,
            message: 'Mutual connections retrieved successfully',
            data: {
                mutualConnections: formattedMutualFriends,
                totalCount: formattedMutualFriends.length
            }
        });
    }
    catch (error) {
        console.error('Error retrieving mutual friends:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve mutual friends'
        });
    }
};
exports.getMutualFriends = getMutualFriends;
// Generate username from name
const generateUsername = async (name) => {
    const baseUsername = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
    let username = baseUsername;
    let counter = 1;
    while (true) {
        const existingUser = await user_model_1.default.findOne({ where: { username } });
        if (!existingUser) {
            break;
        }
        username = `${baseUsername}${counter}`;
        counter++;
    }
    return username;
};
exports.generateUsername = generateUsername;
// Update user's username
const updateUsername = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { username } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username is required'
            });
        }
        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                success: false,
                message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
            });
        }
        // Check if username is already taken
        const existingUser = await user_model_1.default.findOne({ where: { username } });
        if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({
                success: false,
                message: 'Username is already taken'
            });
        }
        // Update user's username
        const user = await user_model_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        await user.update({ username });
        res.json({
            success: true,
            message: 'Username updated successfully',
            data: { username }
        });
    }
    catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update username'
        });
    }
};
exports.updateUsername = updateUsername;
