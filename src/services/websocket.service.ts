import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import UserOnlineStatus from '../models/userOnlineStatus.model';
import Message from '../models/message.model';
import Conversation from '../models/conversation.model';

interface AuthenticatedSocket {
  userId: number;
  userEmail: string;
}

interface MessageData {
  conversationId: string;
  message: string;
}

interface TypingData {
  conversationId: string;
}

interface MarkReadData {
  conversationId: string;
}

interface GroupMessageData {
  groupId: number;
  message: string;
}

interface GroupTypingData {
  groupId: number;
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<number, string> = new Map(); // userId -> socketId

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        console.log('🔐 WebSocket auth - Token received:', !!token);
        
        if (!token) {
          console.log('❌ WebSocket auth - No token provided');
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        console.log('🔐 WebSocket auth - Decoded token:', { sub: decoded.sub, email: decoded.email });
        
        (socket as any).userId = decoded.sub; // Use 'sub' instead of 'id' as per JWT token structure
        (socket as any).userEmail = decoded.email;
        
        console.log('✅ WebSocket auth - Authentication successful');
        next();
      } catch (error) {
        console.error('❌ WebSocket auth - Authentication failed:', error);
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  private async handleConnection(socket: any) {
    const userId = socket.userId;
    const userEmail = socket.userEmail;

    console.log(`User ${userId} (${userEmail}) connected`);

    // Store socket mapping
    this.userSockets.set(userId, socket.id);

    // Update user online status
    await this.updateUserOnlineStatus(userId, true);

    // Join user to their personal room
    socket.join(`user_${userId}`);

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${userId} disconnected`);
      this.userSockets.delete(userId);
      await this.updateUserOnlineStatus(userId, false);
    });

    // Handle new message
    socket.on('send_message', async (data: MessageData) => {
      console.log('📤 WebSocket - Received send_message event:', data);
      console.log('⚠️  Note: This event is for real-time communication only. Messages should be created via HTTP API.');
      await this.handleNewMessage(socket, data);
    });

    // Handle typing indicator
    socket.on('typing_start', (data: TypingData) => {
      this.handleTypingStart(socket, data);
    });

    socket.on('typing_stop', (data: TypingData) => {
      this.handleTypingStop(socket, data);
    });

    // Handle message read
    socket.on('mark_read', async (data: MarkReadData) => {
      await this.handleMarkAsRead(socket, data);
    });

    // Handle group chat events
    socket.on('join-group', (data: { groupId: number }) => {
      this.handleJoinGroup(socket, data);
    });

    socket.on('leave-group', (data: { groupId: number }) => {
      this.handleLeaveGroup(socket, data);
    });

    socket.on('group-typing-start', (data: GroupTypingData) => {
      this.handleGroupTypingStart(socket, data);
    });

    socket.on('group-typing-stop', (data: GroupTypingData) => {
      this.handleGroupTypingStop(socket, data);
    });
  }

  private async updateUserOnlineStatus(userId: number, isOnline: boolean) {
    try {
      const [status, created] = await UserOnlineStatus.findOrCreate({
        where: { userId },
        defaults: { userId, isOnline, lastSeen: new Date() }
      });

      if (!created) {
        await status.update({ 
          isOnline, 
          lastSeen: isOnline ? new Date() : status.lastSeen 
        });
      }

      // Broadcast online status to connected users
      this.broadcastUserStatus(userId, isOnline);
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  }

  private async handleNewMessage(socket: any, data: MessageData) {
    try {
      const { conversationId, message } = data;
      const senderId = socket.userId;

      console.log(`📤 WebSocket - Processing message from user ${senderId} in conversation ${conversationId}`);

      // Verify user has access to this conversation
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1Id: senderId },
            { user2Id: senderId }
          ]
        }
      });

      console.log(`🔍 WebSocket - Conversation lookup result:`, conversation ? 'Found' : 'Not found');

      if (!conversation) {
        console.log(`❌ WebSocket - Conversation not found for user ${senderId}`);
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      // Get the other user in the conversation
      const otherUserId = conversation.user1Id === senderId ? conversation.user2Id : conversation.user1Id;
      console.log(`👥 WebSocket - Other user in conversation: ${otherUserId}`);

      // Emit to sender for confirmation (without creating database record)
      socket.emit('message_sent', {
        conversationId,
        message: message,
        timestamp: new Date(),
        status: 'sent'
      });

      // Emit to recipient if online (without creating database record)
      const recipientSocketId = this.userSockets.get(otherUserId);
      if (recipientSocketId) {
        this.io!.to(recipientSocketId).emit('new_message', {
          conversationId,
          message: {
            text: message,
            senderId: senderId,
            timestamp: new Date(),
            status: 'sent'
          }
        });
      }

      console.log(`✅ WebSocket - Real-time message sent (no database record created)`);

    } catch (error) {
      console.error('Error handling new message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private handleTypingStart(socket: any, data: TypingData) {
    const { conversationId } = data;
    const senderId = socket.userId;

    // Get the other user in the conversation
    Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: [
          { user1Id: senderId },
          { user2Id: senderId }
        ]
      }
    }).then(conversation => {
      if (conversation) {
        const otherUserId = conversation.user1Id === senderId ? conversation.user2Id : conversation.user1Id;
        const recipientSocketId = this.userSockets.get(otherUserId);
        
        if (recipientSocketId) {
          this.io!.to(recipientSocketId).emit('user_typing', {
            conversationId,
            userId: senderId
          });
        }
      }
    });
  }

  private handleTypingStop(socket: any, data: TypingData) {
    const { conversationId } = data;
    const senderId = socket.userId;

    // Get the other user in the conversation
    Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: [
          { user1Id: senderId },
          { user2Id: senderId }
        ]
      }
    }).then(conversation => {
      if (conversation) {
        const otherUserId = conversation.user1Id === senderId ? conversation.user2Id : conversation.user1Id;
        const recipientSocketId = this.userSockets.get(otherUserId);
        
        if (recipientSocketId) {
          this.io!.to(recipientSocketId).emit('user_stopped_typing', {
            conversationId,
            userId: senderId
          });
        }
      }
    });
  }

  private async handleMarkAsRead(socket: any, data: MarkReadData) {
    try {
      const { conversationId } = data;
      const userId = socket.userId;

      // Verify user has access to this conversation
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      // Mark messages as read
      const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
      
      await Message.update(
        { status: 'read' },
        {
          where: {
            conversationId,
            senderId: otherUserId,
            status: { [Op.ne]: 'read' }
          }
        }
      );

      // Notify sender that messages were read
      const senderSocketId = this.userSockets.get(otherUserId);
      if (senderSocketId) {
        this.io!.to(senderSocketId).emit('messages_read', {
          conversationId,
          readBy: userId
        });
      }

    } catch (error) {
      console.error('Error marking messages as read:', error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  }

  private broadcastUserStatus(userId: number, isOnline: boolean) {
    // Broadcast to all connected users
    this.io!.emit('user_status', {
      userId,
      isOnline,
      lastSeen: new Date()
    });
  }

  // Public method to emit events to user's personal room
  public emitToUser(userId: number, event: string, data: any) {
    console.log(`📡 WebSocket - Emitting ${event} to user ${userId}`);
    console.log(`📡 WebSocket - Room: user_${userId}`);
    console.log(`📡 WebSocket - Data:`, data);
    
    if (this.io) {
      // Get all sockets in the user's personal room
      const room = this.io.sockets.adapter.rooms.get(`user_${userId}`);
      const socketCount = room ? room.size : 0;
      console.log(`📡 WebSocket - Sockets in room user_${userId}: ${socketCount}`);
      
      // List all sockets in the room for debugging
      if (room) {
        const socketIds = Array.from(room);
        console.log(`📡 WebSocket - Socket IDs in room:`, socketIds);
      }
      
      // Try emitting to the user's personal room
      this.io.to(`user_${userId}`).emit(event, data);
      console.log(`✅ WebSocket - User event ${event} emitted successfully to ${socketCount} sockets`);
      
      // Also try direct socket emission as a fallback
      if (socketCount === 0) {
        const userSocketId = this.userSockets.get(userId);
        if (userSocketId) {
          console.log(`⚠️  WebSocket - No sockets in user room, trying direct socket emission`);
          this.io.to(userSocketId).emit(event, data);
          console.log(`✅ WebSocket - Direct socket emission completed`);
        } else {
          console.log(`⚠️  WebSocket - User ${userId} not connected`);
        }
      }
    } else {
      console.log(`❌ WebSocket - IO server not initialized`);
    }
  }

  // Public method to broadcast to all users
  public broadcast(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Get online users
  public getOnlineUsers(): number[] {
    return Array.from(this.userSockets.keys());
  }

  // Check if user is online
  public isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId);
  }

  // Group chat handlers
  private handleJoinGroup(socket: any, data: { groupId: number }) {
    const { groupId } = data;
    const userId = socket.userId;
    
    console.log(`👥 WebSocket - User ${userId} joining group ${groupId}`);
    console.log(`👥 WebSocket - Socket ID: ${socket.id}`);
    console.log(`👥 WebSocket - Room name: group_${groupId}`);
    
    // Join the group room
    socket.join(`group_${groupId}`);
    
    // Verify room membership
    const room = this.io!.sockets.adapter.rooms.get(`group_${groupId}`);
    const socketCount = room ? room.size : 0;
    console.log(`👥 WebSocket - Room ${groupId} now has ${socketCount} sockets`);
    
    if (room) {
      const socketIds = Array.from(room);
      console.log(`👥 WebSocket - Sockets in room:`, socketIds);
    }
    
    // Notify other group members
    socket.to(`group_${groupId}`).emit('member-joined', {
      groupId,
      userId
    });
    
    console.log(`✅ WebSocket - User ${userId} successfully joined group ${groupId}`);
  }

  private handleLeaveGroup(socket: any, data: { groupId: number }) {
    const { groupId } = data;
    const userId = socket.userId;
    
    console.log(`👥 WebSocket - User ${userId} leaving group ${groupId}`);
    
    // Leave the group room
    socket.leave(`group_${groupId}`);
    
    // Notify other group members
    socket.to(`group_${groupId}`).emit('member-left', {
      groupId,
      userId
    });
  }

  private handleGroupTypingStart(socket: any, data: GroupTypingData) {
    const { groupId } = data;
    const userId = socket.userId;
    
    console.log(`👥 WebSocket - User ${userId} typing in group ${groupId}`);
    
    // Emit to all group members except sender
    socket.to(`group_${groupId}`).emit('group-user-typing', {
      groupId,
      userId
    });
  }

  private handleGroupTypingStop(socket: any, data: GroupTypingData) {
    const { groupId } = data;
    const userId = socket.userId;
    
    console.log(`👥 WebSocket - User ${userId} stopped typing in group ${groupId}`);
    
    // Emit to all group members except sender
    socket.to(`group_${groupId}`).emit('group-user-stopped-typing', {
      groupId,
      userId
    });
  }

  // Public method to emit to group
  public emitToGroup(groupId: number, event: string, data: any) {
    console.log(`📡 WebSocket - Emitting ${event} to group ${groupId}`);
    console.log(`📡 WebSocket - Room: group_${groupId}`);
    console.log(`📡 WebSocket - Data:`, data);
    
    if (this.io) {
      // Get all sockets in the room
      const room = this.io.sockets.adapter.rooms.get(`group_${groupId}`);
      const socketCount = room ? room.size : 0;
      console.log(`📡 WebSocket - Sockets in room group_${groupId}: ${socketCount}`);
      
      // List all sockets in the room for debugging
      if (room) {
        const socketIds = Array.from(room);
        console.log(`📡 WebSocket - Socket IDs in room:`, socketIds);
      }
      
      // Try emitting to the room
      this.io.to(`group_${groupId}`).emit(event, data);
      console.log(`✅ WebSocket - Group event ${event} emitted successfully to ${socketCount} sockets`);
      
      // Also try broadcasting to all connected sockets as a fallback
      if (socketCount === 0) {
        console.log(`⚠️  WebSocket - No sockets in room, trying broadcast to all connected users`);
        this.io.emit(event, data);
        console.log(`✅ WebSocket - Broadcast fallback completed`);
      }
    } else {
      console.log(`❌ WebSocket - IO server not initialized`);
    }
  }

}

export default new WebSocketService(); 