import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
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
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        (socket as any).userId = decoded.id;
        (socket as any).userEmail = decoded.email;
        
        next();
      } catch (error) {
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

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      // Create the message
      const newMessage = await Message.create({
        conversationId,
        senderId,
        text: message,
        status: 'sent'
      });

      // Get the other user in the conversation
      const otherUserId = conversation.user1Id === senderId ? conversation.user2Id : conversation.user1Id;

      // Emit to sender
      socket.emit('message_sent', {
        messageId: newMessage.id,
        conversationId,
        message: newMessage.text,
        timestamp: newMessage.createdAt,
        status: newMessage.status
      });

      // Emit to recipient if online
      const recipientSocketId = this.userSockets.get(otherUserId);
      if (recipientSocketId) {
        this.io!.to(recipientSocketId).emit('new_message', {
          conversationId,
          message: {
            id: newMessage.id,
            text: newMessage.text,
            senderId: newMessage.senderId,
            timestamp: newMessage.createdAt,
            status: newMessage.status
          }
        });
      }

      // Update conversation timestamp
      await conversation.update({ updatedAt: new Date() });

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

  // Public method to emit events
  public emitToUser(userId: number, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
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
}

export default new WebSocketService(); 