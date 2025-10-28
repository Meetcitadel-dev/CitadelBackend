"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enhancedExplore_controller_1 = __importDefault(require("../controllers/enhancedExplore.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// GET /api/v1/enhanced-explore/profile/gender - Get user's gender
router.get('/profile/gender', enhancedExplore_controller_1.default.getUserGender);
// GET /api/v1/enhanced-explore/adjectives/selections/:targetUserId - Get adjective selections for a user
router.get('/adjectives/selections/:targetUserId', enhancedExplore_controller_1.default.getAdjectiveSelections);
// GET /api/v1/enhanced-explore/adjectives/available/:targetUserId - Get available adjectives for a profile
router.get('/adjectives/available/:targetUserId', enhancedExplore_controller_1.default.getAvailableAdjectives);
// POST /api/v1/enhanced-explore/adjectives/select - Select adjective for a profile
router.post('/adjectives/select', enhancedExplore_controller_1.default.selectAdjective);
// GET /api/v1/enhanced-explore/matches/state/:targetUserId - Get match state between two users
router.get('/matches/state/:targetUserId', enhancedExplore_controller_1.default.getMatchState);
// POST /api/v1/enhanced-explore/matches/connect - Connect after match
router.post('/matches/connect', enhancedExplore_controller_1.default.connectAfterMatch);
// GET /api/v1/enhanced-explore/matches/ice-breaking/:targetUserId - Get ice-breaking prompt
router.get('/matches/ice-breaking/:targetUserId', enhancedExplore_controller_1.default.getIceBreakingPrompt);
exports.default = router;
