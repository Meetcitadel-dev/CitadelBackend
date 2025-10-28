"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const groupChat_controller_1 = __importDefault(require("../controllers/groupChat.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// POST /api/v1/groups - Create a new group
router.post('/', groupChat_controller_1.default.createGroup);
// GET /api/v1/groups - Get user's groups
router.get('/', groupChat_controller_1.default.getGroups);
// GET /api/v1/groups/{groupId} - Get specific group details
router.get('/:groupId', groupChat_controller_1.default.getGroup);
// PUT /api/v1/groups/{groupId} - Update group details
router.put('/:groupId', groupChat_controller_1.default.updateGroup);
// DELETE /api/v1/groups/{groupId} - Delete group
router.delete('/:groupId', groupChat_controller_1.default.deleteGroup);
// POST /api/v1/groups/{groupId}/members - Add members to group
router.post('/:groupId/members', groupChat_controller_1.default.addMembers);
// DELETE /api/v1/groups/{groupId}/members/{memberId} - Remove member from group
router.delete('/:groupId/members/:memberId', groupChat_controller_1.default.removeMember);
// POST /api/v1/groups/{groupId}/leave - Leave group
router.post('/:groupId/leave', groupChat_controller_1.default.leaveGroup);
// GET /api/v1/groups/{groupId}/messages - Get group messages
router.get('/:groupId/messages', groupChat_controller_1.default.getGroupMessages);
// POST /api/v1/groups/{groupId}/messages - Send message to group
router.post('/:groupId/messages', groupChat_controller_1.default.sendGroupMessage);
// POST /api/v1/groups/{groupId}/messages/read - Mark group messages as read
router.post('/:groupId/messages/read', groupChat_controller_1.default.markGroupMessagesAsRead);
exports.default = router;
