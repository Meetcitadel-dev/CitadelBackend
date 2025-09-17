import { Request, Response } from 'express';
import { Op, Transaction } from 'sequelize';
import User from '../models/user.model';
import Connection from '../models/connection.model';
import Group from '../models/group.model';
import GroupMember from '../models/groupMember.model';
import GroupMessage from '../models/groupMessage.model';
import GroupMessageRead from '../models/groupMessageRead.model';
import UserImage from '../models/userImage.model';
import sequelize from '../config/db';
import websocketService from '../services/websocket.service';
import unreadCountService from '../services/unreadCount.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

class GroupChatController {
  // Get user's connections for group creation
  async getConnections(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      console.log('🔍 [GROUP] Getting connections for user ID:', userId);

      const connections = await Connection.findAll({
        where: {
          [Op.or]: [
            { userId1: userId },
            { userId2: userId }
          ],
          status: 'connected'
        },
        include: [
          {
            model: User,
            as: 'connectionUser1',
            attributes: ['id', 'name', 'username'],
            include: [
              {
                model: UserImage,
                as: 'images',
                attributes: ['cloudfrontUrl'],
                required: false
              }
            ]
          },
          {
            model: User,
            as: 'connectionUser2',
            attributes: ['id', 'name', 'username'],
            include: [
              {
                model: UserImage,
                as: 'images',
                attributes: ['cloudfrontUrl'],
                required: false
              }
            ]
          }
        ]
      });

      const formattedConnections = connections.map(connection => {
        const otherUser = connection.userId1 === userId ? connection.connectionUser2 : connection.connectionUser1;
        return {
          id: otherUser.id,
          name: otherUser.name || otherUser.username || 'Unknown User',
          location: 'IIT Delhi', // TODO: Add actual location from user profile
          avatar: (otherUser as any).images?.[0]?.cloudfrontUrl || null
        };
      });

      console.log('✅ [GROUP] Returning connections:', formattedConnections.length);

      res.json({
        success: true,
        connections: formattedConnections
      });
    } catch (error) {
      console.error('❌ [GROUP] Error fetching connections:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch connections'
      });
    }
  }

  // Create a new group
  async createGroup(req: AuthenticatedRequest, res: Response) {
    const transaction = await sequelize.transaction();
    
    try {
      const userId = req.user!.id;
      const { name, description, memberIds } = req.body;

      // Validation
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Group name is required'
        });
      }

      if (name.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Group name too long (max 255 characters)'
        });
      }

      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one member is required'
        });
      }

      if (memberIds.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Group cannot have more than 50 members'
        });
      }

      // Verify all members are connections
      const connections = await Connection.findAll({
        where: {
          [Op.or]: [
            { userId1: userId, userId2: { [Op.in]: memberIds } },
            { userId2: userId, userId1: { [Op.in]: memberIds } }
          ],
          status: 'connected'
        }
      });

      if (connections.length !== memberIds.length) {
        return res.status(400).json({
          success: false,
          message: 'All members must be your connections'
        });
      }

      // Create group
      const group = await Group.create({
        name: name.trim(),
        description: description?.trim() || null,
        createdBy: userId
      }, { transaction });

      // Add creator as admin
      await GroupMember.create({
        groupId: group.id,
        userId: userId,
        isAdmin: true
      }, { transaction });

      // Add members
      const memberPromises = memberIds.map(memberId =>
        GroupMember.create({
          groupId: group.id,
          userId: memberId,
          isAdmin: false
        }, { transaction })
      );

      await Promise.all(memberPromises);

      // Get group with members
      const groupWithMembers = await Group.findByPk(group.id, {
        include: [
          {
            model: GroupMember,
            as: 'members',
            include: [
              {
                model: User,
                as: 'member',
                attributes: ['id', 'name', 'username'],
                include: [
                  {
                    model: UserImage,
                    as: 'images',
                    attributes: ['cloudfrontUrl'],
                    required: false
                  }
                ]
              }
            ]
          }
        ],
        transaction
      });

      const formattedGroup = {
        id: groupWithMembers!.id,
        name: groupWithMembers!.name,
        description: groupWithMembers!.description,
        avatar: groupWithMembers!.avatarUrl,
        members: (groupWithMembers as any).members.map((member: any) => ({
          id: member.member.id,
          name: member.member.name || member.member.username || 'Unknown User',
          location: 'IIT Delhi', // TODO: Add actual location
          avatar: member.member.images?.[0]?.cloudfrontUrl || null,
          isAdmin: member.isAdmin,
          joinedAt: member.joinedAt
        })),
        memberCount: (groupWithMembers as any).members.length,
        createdAt: groupWithMembers!.createdAt,
        updatedAt: groupWithMembers!.updatedAt,
        lastMessage: null,
        unreadCount: 0,
        isAdmin: true
      };

      await transaction.commit();

      // Notify members via WebSocket (they will receive this when they join the group)
      // The group creation notification is sent individually since users aren't in the group room yet
      memberIds.forEach(memberId => {
        if (websocketService.isUserOnline(memberId)) {
          websocketService.emitToUser(memberId, 'group-created', {
            group: formattedGroup
          });
        }
      });

      console.log('✅ [GROUP] Group created successfully:', group.id);

      res.json({
        success: true,
        group: formattedGroup
      });
    } catch (error) {
      await transaction.rollback();
      console.error('❌ [GROUP] Error creating group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create group'
      });
    }
  }

  // Get user's groups
  async getGroups(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      console.log('🔍 [GROUP] Getting groups for user ID:', userId);

      const groupMemberships = await GroupMember.findAll({
        where: { userId },
        include: [
          {
            model: Group,
            as: 'group',
            where: { isActive: true },
            include: [
              {
                model: GroupMember,
                as: 'members',
                include: [
                  {
                    model: User,
                    as: 'member',
                    attributes: ['id', 'name', 'username'],
                    include: [
                      {
                        model: UserImage,
                        as: 'images',
                        attributes: ['cloudfrontUrl'],
                        required: false
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });

      const groups = await Promise.all(
        groupMemberships.map(async (membership: any) => {
          const group = membership.group;
          
          // Get last message
          const lastMessage = await GroupMessage.findOne({
            where: { groupId: group.id },
            order: [['createdAt', 'DESC']],
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['id', 'name', 'username']
              }
            ]
          });

          // Get unread count using the unread count service
          const unreadCount = await unreadCountService.getUnreadCount(userId, group.id, true);

          // Check if user is admin
          const userMembership = (group as any).members.find((m: any) => m.userId === userId);
          const isAdmin = userMembership?.isAdmin || false;

          return {
            id: group.id,
            name: group.name,
            description: group.description,
            avatar: group.avatarUrl,
            members: (group as any).members.map((member: any) => ({
              id: member.member.id,
              name: member.member.name || member.member.username || 'Unknown User',
              location: 'IIT Delhi', // TODO: Add actual location
              avatar: member.member.images?.[0]?.cloudfrontUrl || null,
              isAdmin: member.isAdmin,
              joinedAt: member.joinedAt
            })),
            memberCount: (group as any).members.length,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
            lastMessage: lastMessage ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              senderName: (lastMessage as any).sender?.name || (lastMessage as any).sender?.username || 'Unknown User',
              timestamp: lastMessage.createdAt
            } : null,
            unreadCount,
            isAdmin
          };
        })
      );

      console.log('✅ [GROUP] Returning groups:', groups.length);

      res.json({
        success: true,
        groups
      });
    } catch (error) {
      console.error('❌ [GROUP] Error fetching groups:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch groups'
      });
    }
  }

  // Get specific group details
  async getGroup(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;

      if (!groupId || isNaN(Number(groupId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid group ID is required'
        });
      }

      // Check if user is member of the group
      const membership = await GroupMember.findOne({
        where: { groupId: Number(groupId), userId }
      });

      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'Group not found or you are not a member'
        });
      }

      const group = await Group.findOne({
        where: { id: Number(groupId), isActive: true },
        include: [
          {
            model: GroupMember,
            as: 'members',
            include: [
              {
                model: User,
                as: 'member',
                attributes: ['id', 'name', 'username'],
                include: [
                  {
                    model: UserImage,
                    as: 'images',
                    attributes: ['cloudfrontUrl'],
                    required: false
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }

      // Get last message
      const lastMessage = await GroupMessage.findOne({
        where: { groupId: group.id },
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'username']
          }
        ]
      });

      // Get unread count using the unread count service
      const unreadCount = await unreadCountService.getUnreadCount(userId, group.id, true);

      const formattedGroup = {
        id: group.id,
        name: group.name,
        description: group.description,
        avatar: group.avatarUrl,
        members: (group as any).members.map((member: any) => ({
          id: member.member.id,
          name: member.member.name || member.member.username || 'Unknown User',
          location: 'IIT Delhi', // TODO: Add actual location
          avatar: member.member.images?.[0]?.cloudfrontUrl || null,
          isAdmin: member.isAdmin,
          joinedAt: member.joinedAt
        })),
        memberCount: (group as any).members.length,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          senderName: (lastMessage as any).sender?.name || (lastMessage as any).sender?.username || 'Unknown User',
          timestamp: lastMessage.createdAt
        } : null,
        unreadCount,
        isAdmin: membership.isAdmin
      };

      res.json({
        success: true,
        group: formattedGroup
      });
    } catch (error) {
      console.error('❌ [GROUP] Error fetching group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch group'
      });
    }
  }

  // Update group details
  async updateGroup(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;
      const { name, description, memberIds } = req.body;

      if (!groupId || isNaN(Number(groupId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid group ID is required'
        });
      }

      // Check if user is a member of the group
      const membership = await GroupMember.findOne({
        where: { groupId: Number(groupId), userId }
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'You must be a member of the group to update group details'
        });
      }

      const group = await Group.findByPk(Number(groupId));
      if (!group || !group.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }

      // Update group details
      if (name && typeof name === 'string' && name.trim().length > 0) {
        if (name.length > 255) {
          return res.status(400).json({
            success: false,
            message: 'Group name too long (max 255 characters)'
          });
        }
        group.name = name.trim();
      }

      if (description !== undefined) {
        group.description = description?.trim() || null;
      }

      await group.save();

      // Update members if provided
      if (memberIds && Array.isArray(memberIds)) {
        // Remove existing members (except admins)
        await GroupMember.destroy({
          where: {
            groupId: Number(groupId),
            isAdmin: false
          }
        });

        // Add new members
        const memberPromises = memberIds.map(memberId =>
          GroupMember.create({
            groupId: Number(groupId),
            userId: memberId,
            isAdmin: false
          })
        );

        await Promise.all(memberPromises);
      }

      // Get updated group with members
      const updatedGroupWithMembers = await Group.findByPk(Number(groupId), {
        include: [
          {
            model: GroupMember,
            as: 'members',
            include: [
              {
                model: User,
                as: 'member',
                attributes: ['id', 'name', 'username'],
                include: [
                  {
                    model: UserImage,
                    as: 'images',
                    attributes: ['cloudfrontUrl'],
                    required: false
                  }
                ]
              }
            ]
          }
        ]
      });

      // Format the response
      const formattedGroup = {
        id: updatedGroupWithMembers!.id,
        name: updatedGroupWithMembers!.name,
        description: updatedGroupWithMembers!.description,
        avatarUrl: updatedGroupWithMembers!.avatarUrl,
        memberCount: updatedGroupWithMembers!.members!.length,
        members: updatedGroupWithMembers!.members!.map((member: any) => ({
          id: member.member.id,
          name: member.member.name || member.member.username || 'Unknown User',
          location: 'IIT Delhi', // TODO: Add actual location
          avatar: member.member.images?.[0]?.cloudfrontUrl || null,
          isAdmin: member.isAdmin,
          joinedAt: member.joinedAt
        })),
        createdAt: updatedGroupWithMembers!.createdAt,
        updatedAt: updatedGroupWithMembers!.updatedAt,
        isAdmin: membership.isAdmin // Show actual admin status
      };

      // Send success response
      res.json({
        success: true,
        group: formattedGroup
      });
      
      // Notify group members via WebSocket
      websocketService.emitToGroup(Number(groupId), 'group-updated', {
        groupId: Number(groupId),
        group: formattedGroup
      });

    } catch (error) {
      console.error('❌ [GROUP] Error updating group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update group'
      });
    }
  }

  // Delete group
  async deleteGroup(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;

      if (!groupId || isNaN(Number(groupId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid group ID is required'
        });
      }

      // Check if user is admin of the group
      const membership = await GroupMember.findOne({
        where: { groupId: Number(groupId), userId, isAdmin: true }
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'Only group admins can delete the group'
        });
      }

      const group = await Group.findByPk(Number(groupId));
      if (!group || !group.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }

      // Soft delete the group
      group.isActive = false;
      await group.save();

      // Notify group members via WebSocket
      websocketService.emitToGroup(Number(groupId), 'group-deleted', {
        groupId: Number(groupId)
      });

      res.json({
        success: true,
        message: 'Group deleted successfully'
      });
    } catch (error) {
      console.error('❌ [GROUP] Error deleting group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete group'
      });
    }
  }

  // Add members to group
  async addMembers(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;
      const { memberIds } = req.body;

      if (!groupId || isNaN(Number(groupId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid group ID is required'
        });
      }

      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Member IDs are required'
        });
      }

      // Check if user is a member of the group
      const membership = await GroupMember.findOne({
        where: { groupId: Number(groupId), userId }
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'You must be a member of the group to add members'
        });
      }

      // Check current member count
      const currentMemberCount = await GroupMember.count({
        where: { groupId: Number(groupId) }
      });

      if (currentMemberCount + memberIds.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Group cannot have more than 50 members'
        });
      }

      // Add new members
      const memberPromises = memberIds.map(memberId =>
        GroupMember.create({
          groupId: Number(groupId),
          userId: memberId,
          isAdmin: false
        })
      );

      await Promise.all(memberPromises);

      // Notify new members via WebSocket
      memberIds.forEach(memberId => {
        if (websocketService.isUserOnline(memberId)) {
          websocketService.emitToUser(memberId, 'member-added', {
            groupId: Number(groupId)
          });
        }
      });

      res.json({
        success: true,
        message: 'Members added successfully'
      });
    } catch (error) {
      console.error('❌ [GROUP] Error adding members:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add members'
      });
    }
  }

  // Remove member from group
  async removeMember(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId, memberId } = req.params;

      if (!groupId || isNaN(Number(groupId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid group ID is required'
        });
      }

      if (!memberId || isNaN(Number(memberId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid member ID is required'
        });
      }

      // Check if user is a member of the group
      const membership = await GroupMember.findOne({
        where: { groupId: Number(groupId), userId }
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'You must be a member of the group to remove members'
        });
      }

      // Remove the member
      await GroupMember.destroy({
        where: {
          groupId: Number(groupId),
          userId: Number(memberId)
        }
      });

      // Notify removed member via WebSocket
      if (websocketService.isUserOnline(Number(memberId))) {
        websocketService.emitToUser(Number(memberId), 'member-removed', {
          groupId: Number(groupId)
        });
      }

      res.json({
        success: true,
        message: 'Member removed successfully'
      });
    } catch (error) {
      console.error('❌ [GROUP] Error removing member:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove member'
      });
    }
  }

  // Leave group
  async leaveGroup(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;

      if (!groupId || isNaN(Number(groupId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid group ID is required'
        });
      }

      // Check if user is member of the group
      const membership = await GroupMember.findOne({
        where: { groupId: Number(groupId), userId }
      });

      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'You are not a member of this group'
        });
      }

      // If user is admin, check if there are other admins
      if (membership.isAdmin) {
        const adminCount = await GroupMember.count({
          where: { groupId: Number(groupId), isAdmin: true }
        });

        if (adminCount === 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot leave group as the only admin. Please transfer admin role or delete the group.'
          });
        }
      }

      // Remove the member
      await GroupMember.destroy({
        where: {
          groupId: Number(groupId),
          userId
        }
      });

      res.json({
        success: true,
        message: 'Left group successfully'
      });
    } catch (error) {
      console.error('❌ [GROUP] Error leaving group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to leave group'
      });
    }
  }

  // Get group messages
  async getGroupMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      if (!groupId || isNaN(Number(groupId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid group ID is required'
        });
      }

      // Check if user is member of the group
      const membership = await GroupMember.findOne({
        where: { groupId: Number(groupId), userId }
      });

      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'Group not found or you are not a member'
        });
      }

      const messages = await GroupMessage.findAll({
        where: { groupId: Number(groupId) },
        order: [['createdAt', 'ASC']],
        limit: Number(limit),
        offset: Number(offset),
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'username'],
            include: [
              {
                model: UserImage,
                as: 'images',
                attributes: ['cloudfrontUrl'],
                required: false
              }
            ]
          }
        ]
      });

      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        groupId: msg.groupId,
        senderId: msg.senderId,
        senderName: (msg as any).sender?.name || (msg as any).sender?.username || 'Unknown User',
        senderAvatar: (msg as any).sender?.images?.[0]?.cloudfrontUrl || null,
        content: msg.content,
        timestamp: msg.createdAt,
        isEdited: msg.isEdited,
        editedAt: msg.editedAt
      }));

      res.json({
        success: true,
        messages: formattedMessages
      });
    } catch (error) {
      console.error('❌ [GROUP] Error fetching group messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch group messages'
      });
    }
  }

  // Send message to group
  async sendGroupMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;
      const { content } = req.body;

      if (!groupId || isNaN(Number(groupId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid group ID is required'
        });
      }

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message content is required'
        });
      }

      if (content.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Message too long (max 1000 characters)'
        });
      }

      // Check if user is member of the group
      const membership = await GroupMember.findOne({
        where: { groupId: Number(groupId), userId }
      });

      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'Group not found or you are not a member'
        });
      }

      // Create the message
      const message = await GroupMessage.create({
        groupId: Number(groupId),
        senderId: userId,
        content: content.trim(),
        messageType: 'text'
      });

      // Get message with sender details
      const messageWithSender = await GroupMessage.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'username'],
            include: [
              {
                model: UserImage,
                as: 'images',
                attributes: ['cloudfrontUrl'],
                required: false
              }
            ]
          }
        ]
      });

      const formattedMessage = {
        id: messageWithSender!.id,
        groupId: messageWithSender!.groupId,
        senderId: messageWithSender!.senderId,
        senderName: (messageWithSender as any).sender?.name || (messageWithSender as any).sender?.username || 'Unknown User',
        senderAvatar: (messageWithSender as any).sender?.images?.[0]?.cloudfrontUrl || null,
        content: messageWithSender!.content,
        timestamp: messageWithSender!.createdAt,
        isEdited: messageWithSender!.isEdited,
        editedAt: messageWithSender!.editedAt
      };

      // Get all group members
      const groupMembers = await GroupMember.findAll({
        where: { groupId: Number(groupId) }
      });

      // Emit to all group members via group room
      console.log(`📡 [GROUP] Emitting group-message to group ${groupId}`);
      console.log(`📡 [GROUP] Message data:`, {
        groupId: Number(groupId),
        message: formattedMessage
      });
      
      websocketService.emitToGroup(Number(groupId), 'group-message', {
        groupId: Number(groupId),
        message: formattedMessage
      });
      
      console.log(`✅ [GROUP] Group message emitted successfully`);

      // Update unread counts for all group members except sender
      await unreadCountService.updateGroupUnreadCounts(Number(groupId), userId, message.id);

      res.json({
        success: true,
        message: formattedMessage
      });
    } catch (error) {
      console.error('❌ [GROUP] Error sending group message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }
  }

  // Mark group messages as read
  async markGroupMessagesAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;

      console.log(`📖 [GROUP] Marking messages as read for user ${userId} in group ${groupId}`);

      if (!groupId || isNaN(Number(groupId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid group ID is required'
        });
      }

      // Check if user is member of the group
      const membership = await GroupMember.findOne({
        where: { groupId: Number(groupId), userId }
      });

      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'Group not found or you are not a member'
        });
      }

      // Get all messages in the group that the user hasn't read
      const unreadMessages = await GroupMessage.findAll({
        where: {
          groupId: Number(groupId),
          senderId: { [Op.ne]: userId } // Messages not sent by the user
        },
        include: [
          {
            model: GroupMessageRead,
            as: 'readStatuses',
            where: { userId },
            required: false
          }
        ]
      });

      // Filter out messages that are already read
      const actuallyUnreadMessages = unreadMessages.filter(message => 
        !message.readStatuses || message.readStatuses.length === 0
      );

      console.log(`📖 [GROUP] Found ${actuallyUnreadMessages.length} unread messages`);

      // Mark messages as read
      if (actuallyUnreadMessages.length > 0) {
        const readPromises = actuallyUnreadMessages.map(message =>
          GroupMessageRead.findOrCreate({
            where: {
              messageId: message.id,
              userId
            },
            defaults: {
              messageId: message.id,
              userId,
              readAt: new Date()
            }
          })
        );

        await Promise.all(readPromises);
        console.log(`✅ [GROUP] Marked ${actuallyUnreadMessages.length} messages as read`);
      }

      // Reset unread count for this user in this group
      await unreadCountService.resetUnreadCount(userId, Number(groupId), true);

      res.json({
        success: true,
        message: `Marked ${actuallyUnreadMessages.length} messages as read`
      });
    } catch (error) {
      console.error('❌ [GROUP] Error marking messages as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark messages as read'
      });
    }
  }
}

export default new GroupChatController();
