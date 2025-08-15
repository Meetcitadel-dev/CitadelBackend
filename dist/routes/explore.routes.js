"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const explore_controller_1 = __importDefault(require("../controllers/explore.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// GET /api/v1/explore/profiles - Fetch explore profiles with matching algorithm
router.get('/profiles', explore_controller_1.default.getExploreProfiles);
// GET /api/v1/explore/filters - Get available filters for grid view
router.get('/filters', explore_controller_1.default.getAvailableFilters);
// POST /api/v1/explore/adjectives/select - Select adjective for a profile
router.post('/adjectives/select', explore_controller_1.default.selectAdjective);
// GET /api/v1/explore/adjectives/check/:targetUserId - Check if user has selected adjective for profile
router.get('/adjectives/check/:targetUserId', explore_controller_1.default.checkAdjectiveSelection);
// GET /api/v1/explore/adjectives/matches - Get adjective matches for current user
router.get('/adjectives/matches', explore_controller_1.default.getAdjectiveMatches);
// POST /api/v1/explore/track-view - Track profile view
router.post('/track-view', explore_controller_1.default.trackProfileView);
exports.default = router;
