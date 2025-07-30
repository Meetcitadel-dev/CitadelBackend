# Chat System Implementation

## Overview
This document describes the complete chat system implementation for the Citadel backend, including real-time messaging, conversation management, and online status tracking.

## 🚀 Features Implemented

### ✅ Core Features
- **Active Conversations**: Chat with connected users
- **Matched Conversations**: Chat with matched users
- **Real-time Messaging**: Instant message delivery via WebSocket
- **Online Status**: Green dots for online users
- **Message Status**: Sent, delivered, and read receipts
- **Unread Message Counts**: Badge indicators for unread messages
- **Message History**: Complete conversation history
- **Typing Indicators**: Real-time typing status

### ✅ API Endpoints
All required endpoints have been implemented:

1. **GET /api/v1/chats/active** - Get active conversations (connected users)
2. **GET /api/v1/chats/matches** - Get matched conversations (matched users)
3. **GET /api/v1/chats/{conversationId}/messages** - Get conversation messages
4. **POST /api/v1/chats/{conversationId}/messages** - Send message
5. **POST /api/v1/chats/{conversationId}/read** - Mark messages as read
6. **GET /api/v1/chats/conversation/{userId}** - Get or create conversation by user ID

### ✅ Database Schema
Three new tables have been created:

1. **conversations** - Stores conversation data
2. **messages** - Stores individual messages
3. **user_online_status** - Tracks user online status

### ✅ Real-time Features
- WebSocket server for instant messaging
- Online status broadcasting
- Message delivery notifications
- Typing indicators
- Read receipts

## 📁 Files Created/Modified

### New Models
- `src/models/conversation.model.ts` - Conversation model
- `src/models/message.model.ts` - Message model
- `src/models/userOnlineStatus.model.ts` - Online status model

### New Controllers
- `src/controllers/chat.controller.ts` - Chat API controller

### New Routes
- `src/routes/chat.routes.ts` - Chat API routes

### New Services
- `src/services/websocket.service.ts` - WebSocket real-time service

### New Migrations
- `migrations/20250104000000-create-conversations.js`
- `migrations/20250104000001-create-messages.js`
- `migrations/20250104000002-create-user-online-status.js`

### Modified Files
- `src/models/associations.ts` - Added chat model associations
- `src/app.ts` - Added chat routes
- `src/server.ts` - Integrated WebSocket server

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install socket.io @types/socket.io
```

### 2. Run Migrations
```bash
npx sequelize-cli db:migrate
```

### 3. Test the System
```bash
npm run dev
```

### 4. Run Test Script
```bash
npx ts-node src/scripts/testChatSystem.ts
```

## 📡 API Documentation

### Get Active Conversations
```http
GET /api/v1/chats/active
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "uuid",
      "userId": 123,
      "name": "John Doe",
      "profileImage": null,
      "lastMessage": "Hello!",
      "lastMessageTime": "2024-01-15T10:30:00Z",
      "isOnline": true,
      "unreadCount": 3
    }
  ]
}
```

### Get Matched Conversations
```http
GET /api/v1/chats/matches
Authorization: Bearer {token}
```

**Response:** Same format as active conversations

### Get Conversation Messages
```http
GET /api/v1/chats/{conversationId}/messages
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "uuid",
      "text": "Hello!",
      "isSent": true,
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "read"
    }
  ]
}
```

### Send Message
```http
POST /api/v1/chats/{conversationId}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "text": "Hello, how are you?",
    "timestamp": "2024-01-15T10:30:00Z",
    "status": "sent"
  }
}
```

### Mark Messages as Read
```http
POST /api/v1/chats/{conversationId}/read
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true
}
```

### Get Conversation by User ID
```http
GET /api/v1/chats/conversation/{userId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "conversation": {
    "id": "uuid",
    "userId": 123,
    "name": "John Doe",
    "profileImage": null
  }
}
```

## 🔌 WebSocket Events

### Client to Server Events
- `send_message` - Send a new message
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `mark_read` - Mark messages as read

### Server to Client Events
- `new_message` - New message received
- `message_sent` - Message sent successfully
- `messages_read` - Messages marked as read
- `user_status` - User online status update
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `error` - Error message

## 🔐 Security Features

### Authentication
- All API endpoints require JWT authentication
- WebSocket connections require valid JWT token
- User permission validation for all operations

### Data Validation
- Message length limits (1000 characters)
- Input sanitization
- Conversation access validation

### Rate Limiting
- Message sending rate limits
- API endpoint rate limiting

## 🚀 Real-time Features

### WebSocket Connection
```javascript
// Frontend connection example
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for new messages
socket.on('new_message', (data) => {
  console.log('New message:', data);
});

// Send a message
socket.emit('send_message', {
  conversationId: 'uuid',
  message: 'Hello!'
});
```

### Online Status
- Automatic online status updates
- Real-time status broadcasting
- Last seen tracking

### Message Status
- **sent**: Message sent to server
- **delivered**: Message delivered to recipient
- **read**: Message read by recipient

## 🧪 Testing

### Run Test Script
```bash
npx ts-node src/scripts/testChatSystem.ts
```

### Manual Testing
1. Start the server: `npm run dev`
2. Test API endpoints with Postman/curl
3. Test WebSocket connections with a WebSocket client

## 📊 Performance Optimizations

### Database Indexes
- Conversations: `(user1Id, user2Id)` unique index
- Messages: `(conversationId, createdAt)` for efficient message retrieval
- Online Status: `(isOnline, lastSeen)` for status queries

### Caching Strategy
- User online status caching
- Recent conversations caching
- Message history pagination

## 🔄 Integration with Frontend

The frontend can now:
1. Fetch active and matched conversations
2. Send and receive real-time messages
3. Display online status indicators
4. Show unread message counts
5. Handle typing indicators
6. Display message read receipts

## 🎯 Next Steps

### Phase 2 Enhancements
- [ ] Message deletion
- [ ] Message editing
- [ ] File/image sharing
- [ ] Voice messages
- [ ] Group conversations
- [ ] Message search
- [ ] Message reactions

### Phase 3 Features
- [ ] Push notifications
- [ ] Message encryption
- [ ] Advanced moderation
- [ ] Message analytics

## 🐛 Troubleshooting

### Common Issues
1. **WebSocket connection fails**: Check JWT token validity
2. **Messages not sending**: Verify conversation permissions
3. **Online status not updating**: Check database connection
4. **Real-time not working**: Ensure WebSocket service is initialized

### Debug Commands
```bash
# Check database tables
npx sequelize-cli db:migrate:status

# Test database connection
npx ts-node src/scripts/testChatSystem.ts

# Check server logs
npm run dev
```

## 📝 Notes

- The system automatically creates conversations when users connect
- Online status is updated in real-time
- Message history is preserved indefinitely
- All operations are logged for debugging
- The system is scalable and can handle multiple concurrent users

## ✅ Implementation Status

- [x] Database schema and migrations
- [x] API endpoints implementation
- [x] WebSocket real-time messaging
- [x] Online status tracking
- [x] Message status management
- [x] Security and validation
- [x] Testing and documentation
- [x] Frontend integration ready

The chat system is now **fully implemented and ready for production use**! 🎉 