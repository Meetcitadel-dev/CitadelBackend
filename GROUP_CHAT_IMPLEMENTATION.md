# Group Chat Implementation

## Overview
This document outlines the complete implementation of group chat functionality in the Citadel backend. The group chat feature allows users to create groups, add/remove members, send messages, and manage group settings.

## Database Schema

### 1. Groups Table
```sql
CREATE TABLE groups (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatarUrl VARCHAR(500),
    createdBy INTEGER NOT NULL REFERENCES users(id),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Group Members Table
```sql
CREATE TABLE group_members (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    groupId INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    isAdmin BOOLEAN DEFAULT FALSE,
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(groupId, userId)
);
```

### 3. Group Messages Table
```sql
CREATE TABLE group_messages (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    groupId INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    senderId INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    messageType VARCHAR(50) DEFAULT 'text',
    isEdited BOOLEAN DEFAULT FALSE,
    editedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. Group Message Reads Table
```sql
CREATE TABLE group_message_reads (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    messageId INTEGER NOT NULL REFERENCES group_messages(id) ON DELETE CASCADE,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    readAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(messageId, userId)
);
```

## API Endpoints

### Base URL: `/api/v1/group-chats`

### 1. Group Management

#### GET `/connections`
**Purpose**: Fetch user's connections for group creation
**Authentication**: Required
**Response**:
```json
{
  "success": true,
  "connections": [
    {
      "id": 123,
      "name": "John Doe",
      "location": "IIT Delhi",
      "avatar": "https://example.com/avatar.jpg"
    }
  ]
}
```

#### POST `/groups`
**Purpose**: Create a new group
**Authentication**: Required
**Request Body**:
```json
{
  "name": "Study Group",
  "description": "Optional group description",
  "memberIds": [123, 456, 789]
}
```
**Response**:
```json
{
  "success": true,
  "group": {
    "id": 1,
    "name": "Study Group",
    "description": "Optional group description",
    "avatar": null,
    "members": [...],
    "memberCount": 3,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "lastMessage": null,
    "unreadCount": 0,
    "isAdmin": true
  }
}
```

#### GET `/groups`
**Purpose**: Fetch user's groups
**Authentication**: Required
**Response**:
```json
{
  "success": true,
  "groups": [
    {
      "id": 1,
      "name": "Study Group",
      "description": "Optional description",
      "avatar": null,
      "members": [...],
      "memberCount": 3,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "lastMessage": {
        "id": 1,
        "content": "Hello everyone!",
        "senderId": 123,
        "senderName": "John Doe",
        "timestamp": "2024-01-01T00:00:00Z"
      },
      "unreadCount": 2,
      "isAdmin": true
    }
  ]
}
```

#### GET `/groups/{groupId}`
**Purpose**: Fetch specific group details
**Authentication**: Required
**Response**:
```json
{
  "success": true,
  "group": {
    "id": 1,
    "name": "Study Group",
    "description": "Optional description",
    "avatar": null,
    "members": [
      {
        "id": 123,
        "name": "John Doe",
        "location": "IIT Delhi",
        "avatar": "https://example.com/avatar.jpg",
        "isAdmin": true,
        "joinedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "memberCount": 3,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "lastMessage": {...},
    "unreadCount": 2,
    "isAdmin": true
  }
}
```

#### PUT `/groups/{groupId}`
**Purpose**: Update group details
**Authentication**: Required (Admin only)
**Request Body**:
```json
{
  "name": "Updated Group Name",
  "description": "Updated description",
  "memberIds": [123, 456] // Optional: update members
}
```

#### DELETE `/groups/{groupId}`
**Purpose**: Delete group
**Authentication**: Required (Admin only)

### 2. Group Members Management

#### POST `/groups/{groupId}/members`
**Purpose**: Add members to group
**Authentication**: Required (Admin only)
**Request Body**:
```json
{
  "memberIds": [123, 456, 789]
}
```

#### DELETE `/groups/{groupId}/members/{memberId}`
**Purpose**: Remove member from group
**Authentication**: Required (Admin only)

#### POST `/groups/{groupId}/leave`
**Purpose**: Leave group
**Authentication**: Required

### 3. Group Messages

#### GET `/groups/{groupId}/messages`
**Purpose**: Fetch group messages
**Authentication**: Required
**Query Parameters**:
- `limit`: Number of messages to fetch (default: 50)
- `offset`: Offset for pagination (default: 0)
**Response**:
```json
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "groupId": 1,
      "senderId": 123,
      "senderName": "John Doe",
      "senderAvatar": "https://example.com/avatar.jpg",
      "content": "Hello everyone!",
      "timestamp": "2024-01-01T00:00:00Z",
      "isEdited": false,
      "editedAt": null
    }
  ]
}
```

#### POST `/groups/{groupId}/messages`
**Purpose**: Send message to group
**Authentication**: Required
**Request Body**:
```json
{
  "content": "Hello everyone!"
}
```

#### POST `/groups/{groupId}/messages/read`
**Purpose**: Mark group messages as read
**Authentication**: Required

## Updated Chat Endpoints

### GET `/api/v1/chats/active`
**Updated Response**: Now includes both individual conversations and groups
```json
{
  "success": true,
  "conversations": [
    {
      "id": 1,
      "userId": 123,
      "name": "John Doe",
      "profileImage": null,
      "lastMessage": "Hello!",
      "lastMessageTime": "2024-01-01T00:00:00Z",
      "isOnline": false,
      "unreadCount": 2,
      "type": "individual"
    },
    {
      "id": "group_1",
      "groupId": 1,
      "name": "Study Group",
      "profileImage": null,
      "lastMessage": "Hello everyone!",
      "lastMessageTime": "2024-01-01T00:00:00Z",
      "isOnline": false,
      "unreadCount": 3,
      "type": "group",
      "memberCount": 5
    }
  ]
}
```

## Business Logic

### 1. Group Creation Rules
- Only authenticated users can create groups
- Group creator automatically becomes admin
- All selected members must be connections of the creator
- Group name is required, description is optional
- Maximum group size: 50 members
- Minimum group size: 2 members (creator + at least 1 member)

### 2. Group Membership Rules
- Users can only be added to groups if they are connections of an admin
- Admins can add/remove members
- Regular members can leave the group
- If admin leaves, transfer admin role to another member or delete group
- Users can be in maximum 20 groups

### 3. Message Handling
- Only group members can send messages
- Messages are stored with sender information
- Support for message editing (within time limit)
- Track read status for each member
- Real-time message delivery via WebSocket

### 4. Permissions
- **Admin permissions**: Add/remove members, edit group details, delete group
- **Member permissions**: Send messages, view group details, leave group
- **Non-member permissions**: None

### 5. Data Validation
- Group name: 1-255 characters
- Message content: 1-1000 characters
- Member count: 2-50 members per group
- User can be in maximum 20 groups

## Real-time Features

### WebSocket Events
```javascript
// Client joins group
socket.emit('join-group', { groupId: 1 });

// New group message
socket.on('group-message', {
  groupId: 1,
  message: { /* message object */ }
});

// Group created
socket.on('group-created', {
  group: { /* group object */ }
});

// Group updated
socket.on('group-updated', {
  groupId: 1,
  group: { /* updated group object */ }
});

// Group deleted
socket.on('group-deleted', {
  groupId: 1
});

// Member added
socket.on('member-added', {
  groupId: 1
});

// Member removed
socket.on('member-removed', {
  groupId: 1
});
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only access groups they're members of
3. **Input Validation**: Sanitize all user inputs
4. **Rate Limiting**: Limit message sending frequency
5. **Content Moderation**: Optional content filtering
6. **Data Privacy**: Ensure group data is not exposed to non-members

## Performance Considerations

1. **Pagination**: Implement cursor-based pagination for messages
2. **Caching**: Cache frequently accessed group data
3. **Indexing**: Proper database indexes for queries
4. **Message Delivery**: Optimize for real-time delivery
5. **File Uploads**: Support for image/file sharing (future enhancement)

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Error Codes
- `GROUP_NOT_FOUND`: Group doesn't exist
- `NOT_MEMBER`: User is not a member of the group
- `NOT_ADMIN`: User doesn't have admin permissions
- `MEMBER_LIMIT_EXCEEDED`: Group is full
- `INVALID_INPUT`: Invalid request data
- `UNAUTHORIZED`: Authentication required

## Database Migrations

Run the following migrations to set up the group chat tables:

```bash
# Run all group chat migrations
npx sequelize-cli db:migrate --to 20250107000003-create-group-message-reads.js
```

## Testing

### Test Scripts
Create test scripts in `backend/src/scripts/`:

1. `testGroupCreation.ts` - Test group creation flow
2. `testGroupMessages.ts` - Test group messaging
3. `testGroupPermissions.ts` - Test admin/member permissions
4. `testGroupWebSocket.ts` - Test real-time functionality

### Manual Testing
1. Create a group with multiple members
2. Send messages in the group
3. Test admin permissions (add/remove members)
4. Test member permissions (leave group)
5. Test real-time message delivery
6. Test message read status

## Frontend Integration

### API Functions
The frontend should implement these API functions:

```typescript
// Group management
const getConnections = () => fetch('/api/v1/group-chats/connections');
const createGroup = (data) => fetch('/api/v1/group-chats/groups', { method: 'POST', body: JSON.stringify(data) });
const getGroups = () => fetch('/api/v1/group-chats/groups');
const getGroup = (groupId) => fetch(`/api/v1/group-chats/groups/${groupId}`);
const updateGroup = (groupId, data) => fetch(`/api/v1/group-chats/groups/${groupId}`, { method: 'PUT', body: JSON.stringify(data) });
const deleteGroup = (groupId) => fetch(`/api/v1/group-chats/groups/${groupId}`, { method: 'DELETE' });

// Member management
const addMembers = (groupId, memberIds) => fetch(`/api/v1/group-chats/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify({ memberIds }) });
const removeMember = (groupId, memberId) => fetch(`/api/v1/group-chats/groups/${groupId}/members/${memberId}`, { method: 'DELETE' });
const leaveGroup = (groupId) => fetch(`/api/v1/group-chats/groups/${groupId}/leave`, { method: 'POST' });

// Messages
const getGroupMessages = (groupId, limit = 50, offset = 0) => fetch(`/api/v1/group-chats/groups/${groupId}/messages?limit=${limit}&offset=${offset}`);
const sendGroupMessage = (groupId, content) => fetch(`/api/v1/group-chats/groups/${groupId}/messages`, { method: 'POST', body: JSON.stringify({ content }) });
const markGroupMessagesAsRead = (groupId) => fetch(`/api/v1/group-chats/groups/${groupId}/messages/read`, { method: 'POST' });
```

### WebSocket Events
```typescript
// Join group room
socket.emit('join-group', { groupId: 1 });

// Listen for group events
socket.on('group-message', handleGroupMessage);
socket.on('group-created', handleGroupCreated);
socket.on('group-updated', handleGroupUpdated);
socket.on('group-deleted', handleGroupDeleted);
socket.on('member-added', handleMemberAdded);
socket.on('member-removed', handleMemberRemoved);
```

## Deployment Checklist

1. **Database Migration**: Run group chat migrations
2. **Environment Variables**: No additional variables needed
3. **Dependencies**: No additional dependencies
4. **Testing**: Test all group chat functionality
5. **Monitoring**: Monitor group chat activity
6. **Documentation**: Update API documentation

## Future Enhancements

1. **File Sharing**: Support for images, documents, and files
2. **Message Reactions**: Like, heart, etc. reactions to messages
3. **Message Threading**: Reply to specific messages
4. **Group Roles**: More granular permissions (moderator, etc.)
5. **Group Invites**: Invite links for groups
6. **Message Search**: Search within group messages
7. **Message Pinning**: Pin important messages
8. **Group Analytics**: Message statistics and activity

## Support

For issues and questions:
1. Check the error logs
2. Verify database migrations are run
3. Test with the provided test scripts
4. Contact the development team

---

**Note**: This implementation provides a complete group chat system with real-time messaging, member management, and proper security controls. The system is designed to scale and can be extended with additional features as needed.


























