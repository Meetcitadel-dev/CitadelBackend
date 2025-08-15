"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userProfile_controller_1 = require("../controllers/userProfile.controller");
const explore_controller_1 = __importDefault(require("../controllers/explore.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// GET /api/v1/users/gridview - Grid view endpoint (redirects to explore profiles)
router.get('/gridview', explore_controller_1.default.getExploreProfiles);
// GET /api/v1/users/gridview/filters - Get available filters for grid view
router.get('/gridview/filters', explore_controller_1.default.getAvailableFilters);
// GET /api/v1/users/{username} - Get user profile by username
router.get('/:username', userProfile_controller_1.getUserProfileByUsername);
// GET /api/v1/users/{username}/mutual-friends - Get mutual friends list
router.get('/:username/mutual-friends', userProfile_controller_1.getMutualFriends);
// PUT /api/v1/users/username - Update user's username
router.put('/username', userProfile_controller_1.updateUsername);
exports.default = router;
