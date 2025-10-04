"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const university_model_1 = __importDefault(require("../models/university.model"));
const userImage_model_1 = __importDefault(require("../models/userImage.model"));
const connection_model_1 = __importDefault(require("../models/connection.model"));
const connectionRequest_model_1 = __importDefault(require("../models/connectionRequest.model"));
const adjectiveMatch_model_1 = __importDefault(require("../models/adjectiveMatch.model"));
const interaction_model_1 = __importDefault(require("../models/interaction.model"));
const s3_service_1 = require("../services/s3.service");
const sequelize_1 = require("sequelize");
// Adjective pool for matching
const ADJECTIVES = [
    'Smart', 'Creative', 'Funny', 'Ambitious', 'Kind',
    'Adventurous', 'Reliable', 'Witty', 'Thoughtful', 'Bold',
    'Genuine', 'Energetic', 'Calm', 'Inspiring', 'Curious', 'Intelligent',
    'Disciplined', 'Handsome', 'Strong', 'Brave', 'Confident', 'Loyal', 'Honest',
    'Hardworking', 'Protective', 'Respectful', 'Determined', 'Steadfast', 'Courageous',
    'Dutiful', 'Gallant', 'Steady', 'Vigilant', 'Tough', 'Sincere', 'Decisive',
    'Daring', 'Honorable', 'Beautiful', 'Graceful', 'Caring', 'Elegant', 'Nurturing',
    'Gentle', 'Compassionate', 'Radiant', 'Warm', 'Empathetic', 'Intuitive', 'Joyful',
    'Poised', 'Articulate', 'Persistent', 'Loving', 'Cheerful', 'Vibrant', 'Serene',
    'Lovable', 'Bright', 'Charming', 'Gracious', 'Selfless', 'Optimistic', 'Organized',
    'Adaptable', 'Generous', 'Passionate', 'Enthusiastic', 'Mindful', 'Innovative',
    'Dedicated', 'Resourceful', 'Practical', 'Considerate', 'Collaborative', 'Resilient',
    'Open-minded', 'Level-headed', 'Analytical', 'Patient'
];
// Year mapping from frontend to database values
const YEAR_MAPPING = {
    'First': '1st',
    'Second': '2nd',
    'Third': '3rd',
    'Fourth': '4th',
    '1st': '1st',
    '2nd': '2nd',
    '3rd': '3rd',
    '4th': '4th'
};
// Matching criteria weights
const MATCHING_CRITERIA = {
    collegeWeight: 0.4,
    yearWeight: 0.3,
    degreeWeight: 0.2,
    skillsWeight: 0.1
};
// Calculate match score between two users
const calculateMatchScore = (user1, user2) => {
    let score = 0;
    // Same college + same year + same degree (Score: 1.0)
    if (user1.universityId === user2.universityId &&
        user1.year === user2.year &&
        user1.degree === user2.degree) {
        score = 1.0;
    }
    // Same college + same year (Score: 0.7)
    else if (user1.universityId === user2.universityId &&
        user1.year === user2.year) {
        score = 0.7;
    }
    // Same college (Score: 0.4)
    else if (user1.universityId === user2.universityId) {
        score = 0.4;
    }
    // Same city + same degree + same year (Score: 0.3)
    else if (user1.userUniversity?.country === user2.userUniversity?.country &&
        user1.degree === user2.degree &&
        user1.year === user2.year) {
        score = 0.3;
    }
    // Same city + same year (Score: 0.2)
    else if (user1.userUniversity?.country === user2.userUniversity?.country &&
        user1.year === user2.year) {
        score = 0.2;
    }
    // Same city (Score: 0.1)
    else if (user1.userUniversity?.country === user2.userUniversity?.country) {
        score = 0.1;
    }
    return score;
};
// Get connection state between two users
const getConnectionState = async (userId1, userId2) => {
    // First check the Connection table
    const connection = await connection_model_1.default.findOne({
        where: {
            [sequelize_1.Op.or]: [
                { userId1, userId2 },
                { userId1: userId2, userId2: userId1 }
            ]
        }
    });
    if (connection) {
        return connection;
    }
    // If no connection found, check ConnectionRequest table
    const request = await connectionRequest_model_1.default.findOne({
        where: {
            [sequelize_1.Op.or]: [
                { requesterId: userId1, targetId: userId2 },
                { requesterId: userId2, targetId: userId1 }
            ]
        }
    });
    if (request) {
        // Convert ConnectionRequest to Connection-like format
        return {
            id: request.id,
            userId1: request.requesterId,
            userId2: request.targetId,
            status: request.status === 'pending' ? 'requested' : (request.status === 'accepted' ? 'connected' : request.status),
            requesterId: request.requesterId,
            targetId: request.targetId,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt
        };
    }
    return null;
};
// Get selected adjectives for a user pair
const getSelectedAdjectives = async (userId1, userId2) => {
    const adjectives = await adjectiveMatch_model_1.default.findAll({
        where: {
            userId1,
            userId2
        },
        attributes: ['adjective']
    });
    return adjectives.map(adj => adj.adjective);
};
// Helper function to detect if a URL is from UploadThing
const isUploadThingUrl = (url) => {
    return typeof url === 'string' && url.includes('utfs.io');
};
// Helper function to regenerate fresh URLs for images
const regenerateImageUrls = async (images) => {
    return Promise.all(images.map(async (img) => {
        // Check if this specific image is from UploadThing
        if (isUploadThingUrl(img.cloudfrontUrl)) {
            // UploadThing URLs are permanent, return as-is
            return {
                id: img.id,
                cloudfrontUrl: img.cloudfrontUrl,
                originalName: img.originalName,
                mimeType: img.mimeType,
                fileSize: img.fileSize,
                createdAt: img.createdAt,
                updatedAt: img.updatedAt
            };
        }
        // For S3/CloudFront images, regenerate fresh signed URLs
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
            createdAt: img.createdAt,
            updatedAt: img.updatedAt
        };
    }));
};
// Fetch explore profiles with matching algorithm
const getExploreProfiles = async (req, res) => {
    try {
        const { limit = 20, offset = 0, search = '', sortBy = 'match_score', gender = '', years = [], universities = [], skills = [] } = req.query;
        const currentUserId = req.user.id;
        console.log('🔍 ENHANCED EXPLORE PROFILES DEBUG:');
        console.log(`   Current User ID: ${currentUserId}`);
        console.log(`   Limit: ${limit}, Offset: ${offset}`);
        console.log(`   Search: ${search}`);
        console.log(`   SortBy: ${sortBy}`);
        console.log(`   Gender: ${gender}`);
        console.log(`   Years: ${years}`);
        console.log(`   Universities: ${universities}`);
        console.log(`   Skills: ${skills}`);
        // Get current user with university info
        const currentUser = await user_model_1.default.findByPk(currentUserId, {
            include: [{
                    model: university_model_1.default,
                    as: 'userUniversity'
                }]
        });
        if (!currentUser) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        // Get all users except current user and blocked users
        const blockedConnections = await connection_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: currentUserId, status: 'blocked' },
                    { userId2: currentUserId, status: 'blocked' }
                ]
            }
        });
        const blockedUserIds = blockedConnections.map(conn => conn.userId1 === currentUserId ? conn.userId2 : conn.userId1);
        console.log(`   Blocked User IDs: ${blockedUserIds}`);
        // Build where clause for user filtering
        const whereClause = {
            id: {
                [sequelize_1.Op.ne]: currentUserId,
                [sequelize_1.Op.notIn]: blockedUserIds
            },
            isProfileComplete: true
        };
        // Add search filter
        if (search && typeof search === 'string' && search.trim()) {
            whereClause[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.iLike]: `%${search.trim()}%` } }
            ];
        }
        // Add gender filter
        if (gender && typeof gender === 'string' && gender.trim()) {
            whereClause.gender = { [sequelize_1.Op.iLike]: gender.trim() };
        }
        // Add years filter
        if (years !== undefined) {
            const yearsArray = Array.isArray(years)
                ? years
                : typeof years === 'string'
                    ? [years]
                    : [];
            if (yearsArray.length > 0) {
                const mappedYears = yearsArray.map((year) => YEAR_MAPPING[year] || year);
                whereClause.year = { [sequelize_1.Op.in]: mappedYears };
            }
        }
        // Add universities filter
        if (universities !== undefined) {
            const universitiesArray = Array.isArray(universities)
                ? universities
                : typeof universities === 'string'
                    ? [universities]
                    : [];
            if (universitiesArray.length > 0) {
                whereClause['$userUniversity.name$'] = { [sequelize_1.Op.in]: universitiesArray };
            }
        }
        // Add skills filter
        if (skills !== undefined) {
            const skillsArray = Array.isArray(skills)
                ? skills
                : typeof skills === 'string'
                    ? [skills]
                    : [];
            if (skillsArray.length > 0) {
                whereClause.skills = { [sequelize_1.Op.overlap]: skillsArray };
            }
        }
        console.log(`   Where clause:`, JSON.stringify(whereClause, null, 2));
        // Get all available users with filters and view count
        // First get ALL users (without limit/offset) to properly sort connected users to the end
        let allUsers = await user_model_1.default.findAll({
            where: whereClause,
            include: [
                {
                    model: university_model_1.default,
                    as: 'userUniversity'
                },
                {
                    model: userImage_model_1.default,
                    as: 'images',
                    where: { id: { [sequelize_1.Op.ne]: null } },
                    required: false
                }
            ],
            order: sortBy === 'match_score' ? [['createdAt', 'DESC']] : getSortOrder(sortBy)
        });
        // If there's a search term, also search by university name
        if (search && typeof search === 'string' && search.trim()) {
            const searchTerm = search.trim();
            // Get users by university name
            const usersByUniversity = await user_model_1.default.findAll({
                where: {
                    id: {
                        [sequelize_1.Op.ne]: currentUserId,
                        [sequelize_1.Op.notIn]: blockedUserIds
                    },
                    isProfileComplete: true
                },
                include: [
                    {
                        model: university_model_1.default,
                        as: 'userUniversity',
                        where: {
                            name: { [sequelize_1.Op.iLike]: `%${searchTerm}%` }
                        }
                    },
                    {
                        model: userImage_model_1.default,
                        as: 'images',
                        where: { id: { [sequelize_1.Op.ne]: null } },
                        required: false
                    }
                ],
                order: sortBy === 'match_score' ? [['createdAt', 'DESC']] : getSortOrder(sortBy)
            });
            // Combine and deduplicate results
            const combinedUsers = [...allUsers, ...usersByUniversity];
            const uniqueUsers = combinedUsers.filter((user, index, self) => index === self.findIndex(u => u.id === user.id));
            allUsers = uniqueUsers;
        }
        console.log(`   All users found: ${allUsers.length}`);
        // Process each user to add match score and connection state
        const profiles = await Promise.all(allUsers.map(async (user) => {
            const matchScore = calculateMatchScore(currentUser, user);
            const connectionState = await getConnectionState(currentUserId, user.id);
            const selectedAdjectives = await getSelectedAdjectives(currentUserId, user.id);
            // Regenerate fresh URLs for user images
            const freshImages = user.images && user.images.length > 0
                ? await regenerateImageUrls(user.images)
                : [];
            // Prefer UploadThing URLs exclusively if present
            const utImages = freshImages.filter((img) => isUploadThingUrl(img.cloudfrontUrl));
            const cfImages = freshImages.filter((img) => !isUploadThingUrl(img.cloudfrontUrl));
            // Select profileImage from UploadThing first, else fallback to CloudFront
            const profileImage = utImages.length > 0
                ? utImages[0].cloudfrontUrl
                : (cfImages.length > 0 ? cfImages[0].cloudfrontUrl : null);
            // uploadedImages: only UploadThing if available; else all CloudFront
            const uploadedImages = utImages.length > 0
                ? utImages.map((img) => img.cloudfrontUrl)
                : cfImages.map((img) => img.cloudfrontUrl);
            return {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                university: user.userUniversity,
                degree: user.degree,
                year: user.year,
                gender: user.gender,
                skills: user.skills || [],
                profileImage,
                uploadedImages,
                connectionState: connectionState ? {
                    id: connectionState.id,
                    userId1: connectionState.userId1,
                    userId2: connectionState.userId2,
                    status: connectionState.status,
                    createdAt: connectionState.createdAt,
                    updatedAt: connectionState.updatedAt
                } : null,
                matchScore,
                selectedAdjectives
            };
        }));
        // Sort by match score if requested
        if (sortBy === 'match_score') {
            // Sort all by score desc first
            profiles.sort((a, b) => b.matchScore - a.matchScore);
        }
        // Reorder: place connected users at the end, randomizing their order
        // Preserve existing order for non-connected profiles unless match_score requires tie-randomization
        const connectedProfiles = profiles.filter(p => p.connectionState && p.connectionState.status === 'connected');
        let nonConnectedProfiles = profiles.filter(p => !(p.connectionState && p.connectionState.status === 'connected'));
        // Helper: Fisher-Yates shuffle in-place
        const shuffleInPlace = (arr) => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = arr[i];
                arr[i] = arr[j];
                arr[j] = tmp;
            }
        };
        // If sorting by match_score, randomize within equal-score groups for non-connected profiles
        if (sortBy === 'match_score' && nonConnectedProfiles.length > 1) {
            const scoreToGroup = new Map();
            for (const p of nonConnectedProfiles) {
                const key = Number(p.matchScore || 0);
                const group = scoreToGroup.get(key) || [];
                group.push(p);
                scoreToGroup.set(key, group);
            }
            // Get scores in descending order
            const scoresDesc = Array.from(scoreToGroup.keys()).sort((a, b) => b - a);
            const randomizedNonConnected = [];
            for (const s of scoresDesc) {
                const group = scoreToGroup.get(s);
                if (group.length > 1) {
                    shuffleInPlace(group);
                }
                randomizedNonConnected.push(...group);
            }
            nonConnectedProfiles = randomizedNonConnected;
        }
        // Randomize connected profiles always at the end
        if (connectedProfiles.length > 1) {
            shuffleInPlace(connectedProfiles);
        }
        // Combine profiles with connected users at the end
        const reorderedProfiles = [...nonConnectedProfiles, ...connectedProfiles];
        // Apply pagination AFTER sorting to ensure connected users are at the end
        const startIndex = Number(offset);
        const endIndex = startIndex + Number(limit);
        const paginatedProfiles = reorderedProfiles.slice(startIndex, endIndex);
        // Get total count for pagination
        const totalCount = await user_model_1.default.count({
            where: whereClause,
            include: [
                {
                    model: university_model_1.default,
                    as: 'userUniversity'
                }
            ]
        });
        // Get available filters for frontend
        const availableFilters = await getAvailableFiltersHelper();
        console.log(`   Final profiles to return: ${paginatedProfiles.length}`);
        console.log(`   Total count: ${totalCount}`);
        console.log(`   Has more: ${endIndex < reorderedProfiles.length}`);
        res.json({
            success: true,
            profiles: paginatedProfiles,
            hasMore: endIndex < reorderedProfiles.length,
            totalCount,
            filters: availableFilters
        });
    }
    catch (error) {
        console.error('Error fetching explore profiles:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Helper function to get sort order
const getSortOrder = (sortBy) => {
    switch (sortBy) {
        case 'year_asc':
            return [['year', 'ASC']];
        case 'year_desc':
            return [['year', 'DESC']];
        case 'name_asc':
            return [['name', 'ASC']];
        case 'name_desc':
            return [['name', 'DESC']];
        case 'match_score':
            return [['createdAt', 'DESC']]; // Initial sort by creation date, then re-sort by match score
        default:
            return [['createdAt', 'DESC']];
    }
};
// Get available filters for grid view
const getAvailableFilters = async (req, res) => {
    try {
        const filters = await getAvailableFiltersHelper();
        res.json({
            success: true,
            filters
        });
    }
    catch (error) {
        console.error('Error getting available filters:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Helper function to get available filters
const getAvailableFiltersHelper = async () => {
    try {
        // Get available universities
        const universities = await university_model_1.default.findAll({
            attributes: ['name'],
            order: [['name', 'ASC']]
        });
        // Get available skills (from all users)
        const usersWithSkills = await user_model_1.default.findAll({
            where: {
                skills: { [sequelize_1.Op.ne]: null }
            },
            attributes: ['skills']
        });
        const allSkills = new Set();
        usersWithSkills.forEach(user => {
            if (user.skills && Array.isArray(user.skills)) {
                user.skills.forEach((skill) => allSkills.add(skill));
            }
        });
        // Get available years
        const years = await user_model_1.default.findAll({
            where: {
                year: { [sequelize_1.Op.ne]: null }
            },
            attributes: ['year'],
            group: ['year'],
            order: [['year', 'ASC']]
        });
        return {
            availableUniversities: universities.map(u => u.name),
            availableSkills: Array.from(allSkills).sort(),
            availableYears: years.map(y => y.year).filter(Boolean)
        };
    }
    catch (error) {
        console.error('Error getting available filters:', error);
        return {
            availableUniversities: [],
            availableSkills: [],
            availableYears: []
        };
    }
};
// Manage connection requests
const manageConnection = async (req, res) => {
    try {
        const { targetUserId, action } = req.body;
        const currentUserId = req.user.id;
        if (!targetUserId || !action) {
            res.status(400).json({ success: false, message: 'Missing required parameters' });
            return;
        }
        let connectionState;
        let message = '';
        switch (action) {
            case 'connect':
                // Check if connection request already exists
                const existingRequest = await connectionRequest_model_1.default.findOne({
                    where: {
                        requesterId: currentUserId,
                        targetId: targetUserId
                    }
                });
                if (existingRequest) {
                    if (existingRequest.status === 'pending') {
                        message = 'Connection request already sent';
                        connectionState = existingRequest;
                    }
                    else if (existingRequest.status === 'accepted') {
                        message = 'Already connected';
                        connectionState = existingRequest;
                    }
                    else if (existingRequest.status === 'rejected') {
                        message = 'Connection request was rejected';
                        connectionState = existingRequest;
                    }
                }
                else {
                    // Create new connection request
                    connectionState = await connectionRequest_model_1.default.create({
                        requesterId: currentUserId,
                        targetId: targetUserId,
                        status: 'pending'
                    });
                    message = 'Connection request sent successfully';
                    // Track the interaction
                    await interaction_model_1.default.create({
                        userId: currentUserId,
                        targetUserId: targetUserId,
                        interactionType: 'connected',
                        timestamp: new Date()
                    });
                }
                break;
            case 'accept':
                // Accept connection request
                const request = await connectionRequest_model_1.default.findOne({
                    where: {
                        requesterId: targetUserId,
                        targetId: currentUserId,
                        status: 'pending'
                    }
                });
                if (!request) {
                    res.status(404).json({ success: false, message: 'Connection request not found' });
                    return;
                }
                await request.update({ status: 'accepted' });
                // Create or update connection
                const [newConnection, created] = await connection_model_1.default.findOrCreate({
                    where: {
                        [sequelize_1.Op.or]: [
                            { userId1: targetUserId, userId2: currentUserId },
                            { userId1: currentUserId, userId2: targetUserId }
                        ]
                    },
                    defaults: {
                        userId1: targetUserId,
                        userId2: currentUserId,
                        status: 'connected'
                    }
                });
                if (!created) {
                    await newConnection.update({ status: 'connected' });
                }
                connectionState = newConnection;
                message = 'Connection request accepted successfully';
                break;
            case 'reject':
                // Reject connection request
                const rejectRequest = await connectionRequest_model_1.default.findOne({
                    where: {
                        requesterId: targetUserId,
                        targetId: currentUserId,
                        status: 'pending'
                    }
                });
                if (!rejectRequest) {
                    res.status(404).json({ success: false, message: 'Connection request not found' });
                    return;
                }
                await rejectRequest.update({ status: 'rejected' });
                message = 'Connection request rejected successfully';
                break;
            case 'remove':
                // Remove connection
                const existingConnection = await connection_model_1.default.findOne({
                    where: {
                        [sequelize_1.Op.or]: [
                            { userId1: currentUserId, userId2: targetUserId },
                            { userId1: targetUserId, userId2: currentUserId }
                        ]
                    }
                });
                if (!existingConnection) {
                    res.status(404).json({ success: false, message: 'Connection not found' });
                    return;
                }
                await existingConnection.destroy();
                message = 'Connection removed successfully';
                break;
            case 'block':
                // Block user
                const blockConnection = await connection_model_1.default.findOne({
                    where: {
                        [sequelize_1.Op.or]: [
                            { userId1: currentUserId, userId2: targetUserId },
                            { userId1: targetUserId, userId2: currentUserId }
                        ]
                    }
                });
                if (blockConnection) {
                    await blockConnection.update({ status: 'blocked' });
                }
                else {
                    await connection_model_1.default.create({
                        userId1: currentUserId,
                        userId2: targetUserId,
                        status: 'blocked'
                    });
                }
                message = 'User blocked successfully';
                break;
            case 'unblock':
                // Unblock user
                const unblockConnection = await connection_model_1.default.findOne({
                    where: {
                        [sequelize_1.Op.or]: [
                            { userId1: currentUserId, userId2: targetUserId },
                            { userId1: targetUserId, userId2: currentUserId }
                        ],
                        status: 'blocked'
                    }
                });
                if (!unblockConnection) {
                    res.status(404).json({ success: false, message: 'Blocked connection not found' });
                    return;
                }
                // Remove the blocked connection entirely
                await unblockConnection.destroy();
                message = 'User unblocked successfully';
                break;
            default:
                res.status(400).json({ success: false, message: 'Invalid action' });
                return;
        }
        res.json({
            success: true,
            message,
            connectionState: connectionState ? {
                id: connectionState.id,
                userId1: connectionState.userId1,
                userId2: connectionState.userId2,
                requesterId: connectionState.requesterId || connectionState.userId1,
                targetId: connectionState.targetId || connectionState.userId2,
                status: connectionState.status,
                createdAt: connectionState.createdAt,
                updatedAt: connectionState.updatedAt
            } : null
        });
    }
    catch (error) {
        console.error('Error managing connection:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Select adjective for a profile
const selectAdjective = async (req, res) => {
    try {
        const { targetUserId, adjective } = req.body;
        const currentUserId = req.user.id;
        if (!targetUserId || !adjective) {
            res.status(400).json({ success: false, message: 'Missing required parameters' });
            return;
        }
        if (!ADJECTIVES.includes(adjective)) {
            res.status(400).json({ success: false, message: 'Invalid adjective' });
            return;
        }
        // Check if users are already connected/matched
        const connectionState = await getConnectionState(currentUserId, targetUserId);
        if (connectionState && connectionState.status === 'connected') {
            res.status(400).json({
                success: false,
                message: 'You are already matched with this person. Cannot select adjectives for matched users.'
            });
            return;
        }
        // Check if user has already interacted with this profile
        const existingInteraction = await interaction_model_1.default.findOne({
            where: {
                userId: currentUserId,
                targetUserId: targetUserId,
                interactionType: 'adjective_selected'
            }
        });
        // Allow updates - don't block if interaction exists
        let isUpdate = false;
        if (existingInteraction) {
            isUpdate = true;
        }
        // Create or update adjective selection
        const [adjectiveMatch, created] = await adjectiveMatch_model_1.default.findOrCreate({
            where: {
                userId1: currentUserId,
                userId2: targetUserId,
                adjective
            },
            defaults: {
                userId1: currentUserId,
                userId2: targetUserId,
                adjective,
                timestamp: new Date(),
                matched: false
            }
        });
        if (!created) {
            // Update timestamp if already exists
            await adjectiveMatch.update({ timestamp: new Date() });
        }
        // Track the interaction (use findOrCreate to avoid duplicate key errors)
        await interaction_model_1.default.findOrCreate({
            where: {
                userId: currentUserId,
                targetUserId: targetUserId,
                interactionType: 'adjective_selected'
            },
            defaults: {
                userId: currentUserId,
                targetUserId: targetUserId,
                interactionType: 'adjective_selected',
                timestamp: new Date()
            }
        });
        // Check for mutual match
        const mutualMatch = await adjectiveMatch_model_1.default.findOne({
            where: {
                userId1: targetUserId,
                userId2: currentUserId,
                adjective
            }
        });
        let matched = false;
        let matchData = null;
        if (mutualMatch) {
            // Update both records as matched
            await adjectiveMatch.update({ matched: true });
            await mutualMatch.update({ matched: true });
            matched = true;
            matchData = {
                userId1: currentUserId,
                userId2: targetUserId,
                adjective,
                timestamp: new Date(),
                matched: true
            };
        }
        res.json({
            success: true,
            matched,
            matchData,
            isUpdate
        });
    }
    catch (error) {
        console.error('Error selecting adjective:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Get adjective matches for current user
const getAdjectiveMatches = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const matches = await adjectiveMatch_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId1: currentUserId },
                    { userId2: currentUserId }
                ],
                matched: true
            },
            include: [
                {
                    model: user_model_1.default,
                    as: 'user1',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: user_model_1.default,
                    as: 'user2',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });
        const formattedMatches = matches.map(match => ({
            userId1: match.userId1,
            userId2: match.userId2,
            adjective: match.adjective,
            timestamp: match.timestamp,
            matched: match.matched,
            otherUser: match.userId1 === currentUserId ? match.user2 : match.user1
        }));
        res.json({
            success: true,
            matches: formattedMatches
        });
    }
    catch (error) {
        console.error('Error getting adjective matches:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Check if user has already selected an adjective for a profile
const checkAdjectiveSelection = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.user.id;
        if (!targetUserId) {
            res.status(400).json({ success: false, message: 'Missing target user ID' });
            return;
        }
        // Check if user has already selected an adjective for this profile
        const existingInteraction = await interaction_model_1.default.findOne({
            where: {
                userId: currentUserId,
                targetUserId: parseInt(targetUserId),
                interactionType: 'adjective_selected'
            }
        });
        if (existingInteraction) {
            res.json({
                success: true,
                hasSelectedAdjective: true,
                message: 'You have already selected an adjective for this profile'
            });
        }
        else {
            res.json({
                success: true,
                hasSelectedAdjective: false,
                message: 'No adjective selected for this profile yet'
            });
        }
    }
    catch (error) {
        console.error('Error checking adjective selection:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Track profile view
const trackProfileView = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUserId = req.user.id;
        if (!targetUserId) {
            res.status(400).json({ success: false, message: 'Missing targetUserId' });
            return;
        }
        // Check if already tracked
        const existingView = await interaction_model_1.default.findOne({
            where: {
                userId: currentUserId,
                targetUserId: targetUserId,
                interactionType: 'viewed'
            }
        });
        if (!existingView) {
            // Track the view
            await interaction_model_1.default.create({
                userId: currentUserId,
                targetUserId: targetUserId,
                interactionType: 'viewed',
                timestamp: new Date()
            });
        }
        res.json({
            success: true,
            message: 'Profile view tracked'
        });
    }
    catch (error) {
        console.error('Error tracking profile view:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Get connection status with specific user
const getConnectionStatus = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.user.id;
        const connectionState = await getConnectionState(currentUserId, Number(targetUserId));
        res.json({
            success: true,
            connectionState: connectionState ? {
                id: connectionState.id,
                userId1: connectionState.userId1,
                userId2: connectionState.userId2,
                status: connectionState.status,
                createdAt: connectionState.createdAt,
                updatedAt: connectionState.updatedAt
            } : null
        });
    }
    catch (error) {
        console.error('Error getting connection status:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Get connections count for the authenticated user
const getConnectionsCount = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        // Count all connections where status is 'connected' and user is either userId1 or userId2
        const connectionsCount = await connection_model_1.default.count({
            where: {
                status: 'connected',
                [sequelize_1.Op.or]: [
                    { userId1: currentUserId },
                    { userId2: currentUserId }
                ]
            }
        });
        res.json({
            success: true,
            connectionsCount,
            message: 'Connections count retrieved successfully'
        });
    }
    catch (error) {
        console.error('Error getting connections count:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.default = {
    getExploreProfiles,
    manageConnection,
    selectAdjective,
    getAdjectiveMatches,
    getConnectionStatus,
    trackProfileView,
    checkAdjectiveSelection,
    getConnectionsCount,
    getAvailableFilters
};
