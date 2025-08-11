import { Router } from 'express';
import groupChatController from '../controllers/groupChat.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// POST /api/v1/groups - Create a new group
router.post('/', groupChatController.createGroup);

// GET /api/v1/groups - Get user's groups
router.get('/', groupChatController.getGroups);

// GET /api/v1/groups/{groupId} - Get specific group details
router.get('/:groupId', groupChatController.getGroup);

// PUT /api/v1/groups/{groupId} - Update group details
router.put('/:groupId', groupChatController.updateGroup);

// DELETE /api/v1/groups/{groupId} - Delete group
router.delete('/:groupId', groupChatController.deleteGroup);

// POST /api/v1/groups/{groupId}/members - Add members to group
router.post('/:groupId/members', groupChatController.addMembers);

// DELETE /api/v1/groups/{groupId}/members/{memberId} - Remove member from group
router.delete('/:groupId/members/:memberId', groupChatController.removeMember);

// POST /api/v1/groups/{groupId}/leave - Leave group
router.post('/:groupId/leave', groupChatController.leaveGroup);

// GET /api/v1/groups/{groupId}/messages - Get group messages
router.get('/:groupId/messages', groupChatController.getGroupMessages);

// POST /api/v1/groups/{groupId}/messages - Send message to group
router.post('/:groupId/messages', groupChatController.sendGroupMessage);

// POST /api/v1/groups/{groupId}/messages/read - Mark group messages as read
router.post('/:groupId/messages/read', groupChatController.markGroupMessagesAsRead);

export default router;
