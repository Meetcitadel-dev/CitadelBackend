"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const explore_controller_1 = __importDefault(require("../controllers/explore.controller"));
const groupChat_controller_1 = __importDefault(require("../controllers/groupChat.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// GET /api/v1/connections - Get user's connections for group creation
router.get('/', groupChat_controller_1.default.getConnections);
// POST /api/v1/connections/manage - Manage connection requests
router.post('/manage', explore_controller_1.default.manageConnection);
// GET /api/v1/connections/status/:targetUserId - Get connection status with specific user
router.get('/status/:targetUserId', explore_controller_1.default.getConnectionStatus);
// GET /api/v1/connections/count - Get connections count for authenticated user
router.get('/count', explore_controller_1.default.getConnectionsCount);
exports.default = router;
