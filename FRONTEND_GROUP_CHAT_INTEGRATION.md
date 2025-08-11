# Frontend Group Chat Integration Guide

## Overview
This document provides a complete guide for integrating the group chat functionality with your frontend application. The backend implementation is now complete and ready for frontend integration.

## Backend Implementation Status ✅

### ✅ Completed Components:
1. **Database Schema** - All tables created with migrations
2. **Models** - Sequelize models with proper associations
3. **API Endpoints** - All required endpoints implemented
4. **Controllers** - Business logic and validation
5. **Routes** - API route definitions
6. **WebSocket Integration** - Real-time event emission
7. **Active Chats Integration** - Groups appear in chat list
8. **Testing Scripts** - Automated API testing

### 📁 Key Backend Files:
- `src/models/group.model.ts` - Group entity
- `src/models/groupMember.model.ts` - Group membership
- `src/models/groupMessage.model.ts` - Group messages
- `src/models/groupMessageRead.model.ts` - Read status tracking
- `src/controllers/groupChat.controller.ts` - Business logic
- `src/routes/groupChat.routes.ts` - API routes
- `src/scripts/testGroupChat.ts` - Testing utilities

## API Endpoints

### Base URLs:
- **Group Management**: `/api/v1/groups` (or `/api/v1/group-chats`)
- **Connections**: `/api/v1/connections`

### 1. Get User Connections
```typescript
GET /api/v1/connections
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "connections": [
    {
      "id": "uuid",
      "name": "John Doe",
      "location": "IIT Delhi",
      "avatar": "https://example.com/avatar.jpg"
    }
  ]
}
```

### 2. Create Group
```typescript
POST /api/v1/groups
Authorization: Bearer <jwt_token>

Body:
{
  "name": "Study Group",
  "description": "Optional description",
  "memberIds": ["uuid1", "uuid2", "uuid3"]
}

Response:
{
  "success": true,
  "group": {
    "id": "uuid",
    "name": "Study Group",
    "description": "Optional description",
    "avatarUrl": null,
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

### 3. Get User's Groups
```typescript
GET /api/v1/groups
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "groups": [
    {
      "id": "uuid",
      "name": "Study Group",
      "description": "Optional description",
      "avatarUrl": null,
      "members": [...],
      "memberCount": 3,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "lastMessage": {
        "id": "uuid",
        "content": "Hello everyone!",
        "senderId": "uuid",
        "senderName": "John Doe",
        "timestamp": "2024-01-01T00:00:00Z"
      },
      "unreadCount": 2,
      "isAdmin": true
    }
  ]
}
```

### 4. Get Group Details
```typescript
GET /api/v1/groups/{groupId}
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "group": {
    "id": "uuid",
    "name": "Study Group",
    "description": "Optional description",
    "avatarUrl": null,
    "members": [
      {
        "id": "uuid",
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

### 5. Update Group
```typescript
PUT /api/v1/groups/{groupId}
Authorization: Bearer <jwt_token>

Body:
{
  "name": "Updated Group Name",
  "description": "Updated description"
}

Response:
{
  "success": true,
  "group": { /* updated group object */ }
}
```

### 6. Delete Group
```typescript
DELETE /api/v1/groups/{groupId}
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "message": "Group deleted successfully"
}
```

### 7. Add Members
```typescript
POST /api/v1/groups/{groupId}/members
Authorization: Bearer <jwt_token>

Body:
{
  "memberIds": ["uuid1", "uuid2", "uuid3"]
}

Response:
{
  "success": true,
  "message": "Members added successfully"
}
```

### 8. Remove Member
```typescript
DELETE /api/v1/groups/{groupId}/members/{memberId}
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "message": "Member removed successfully"
}
```

### 9. Leave Group
```typescript
POST /api/v1/groups/{groupId}/leave
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "message": "Left group successfully"
}
```

### 10. Get Group Messages
```typescript
GET /api/v1/groups/{groupId}/messages?limit=50&offset=0
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "messages": [
    {
      "id": "uuid",
      "groupId": "uuid",
      "senderId": "uuid",
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

### 11. Send Message
```typescript
POST /api/v1/groups/{groupId}/messages
Authorization: Bearer <jwt_token>

Body:
{
  "content": "Hello everyone!"
}

Response:
{
  "success": true,
  "message": {
    "id": "uuid",
    "groupId": "uuid",
    "senderId": "uuid",
    "senderName": "John Doe",
    "senderAvatar": "https://example.com/avatar.jpg",
    "content": "Hello everyone!",
    "timestamp": "2024-01-01T00:00:00Z",
    "isEdited": false,
    "editedAt": null
  }
}
```

### 12. Mark Messages as Read
```typescript
POST /api/v1/groups/{groupId}/messages/read
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "message": "Messages marked as read"
}
```

## WebSocket Events

### Client Events (Frontend → Backend)
```typescript
// Join a group room
socket.emit('join-group', { groupId: 'uuid' });

// Leave a group room
socket.emit('leave-group', { groupId: 'uuid' });
```

### Server Events (Backend → Frontend)
```typescript
// New message in group
socket.on('group-message', {
  groupId: 'uuid',
  message: {
    id: 'uuid',
    groupId: 'uuid',
    senderId: 'uuid',
    senderName: 'John Doe',
    senderAvatar: 'https://example.com/avatar.jpg',
    content: 'Hello everyone!',
    timestamp: '2024-01-01T00:00:00Z',
    isEdited: false,
    editedAt: null
  }
});

// Member joined group
socket.on('member-joined', {
  groupId: 'uuid',
  member: {
    id: 'uuid',
    name: 'John Doe',
    location: 'IIT Delhi',
    avatar: 'https://example.com/avatar.jpg',
    isAdmin: false,
    joinedAt: '2024-01-01T00:00:00Z'
  }
});

// Member left group
socket.on('member-left', {
  groupId: 'uuid',
  memberId: 'uuid'
});

// Group updated
socket.on('group-updated', {
  groupId: 'uuid',
  group: {
    id: 'uuid',
    name: 'Updated Group Name',
    description: 'Updated description',
    avatarUrl: null,
    updatedAt: '2024-01-01T00:00:00Z'
  }
});

// Group deleted
socket.on('group-deleted', {
  groupId: 'uuid'
});
```

## Active Chats Integration

The existing `/api/v1/chats/active-conversations` endpoint has been updated to include group chats alongside individual conversations.

### Updated Response Structure:
```typescript
{
  "success": true,
  "conversations": [
    // Individual conversations
    {
      "id": "uuid",
      "name": "John Doe",
      "profileImage": "https://example.com/avatar.jpg",
      "lastMessage": "Hello!",
      "lastMessageTime": "2024-01-01T00:00:00Z",
      "isOnline": false,
      "unreadCount": 2,
      "type": "individual"
    },
    // Group conversations
    {
      "id": "group_uuid",
      "groupId": "uuid",
      "name": "Study Group",
      "profileImage": null,
      "lastMessage": "Hello everyone!",
      "lastMessageTime": "2024-01-01T00:00:00Z",
      "isOnline": false,
      "unreadCount": 5,
      "type": "group",
      "memberCount": 3
    }
  ]
}
```

## TypeScript Types

```typescript
// Group Types
interface Group {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  isAdmin: boolean;
  joinedAt: string;
  user?: User;
}

interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  sender?: User;
}

interface GroupMessageRead {
  id: string;
  messageId: string;
  userId: string;
  readAt: string;
}

// API Response Types
interface ConnectionsResponse {
  success: boolean;
  connections: Array<{
    id: string;
    name: string;
    location: string;
    avatar?: string;
  }>;
}

interface GroupResponse {
  success: boolean;
  group: Group & {
    members: GroupMember[];
    memberCount: number;
    lastMessage?: GroupMessage;
    unreadCount: number;
    isAdmin: boolean;
  };
}

interface GroupsResponse {
  success: boolean;
  groups: Array<Group & {
    members: GroupMember[];
    memberCount: number;
    lastMessage?: GroupMessage;
    unreadCount: number;
    isAdmin: boolean;
  }>;
}

interface GroupMessagesResponse {
  success: boolean;
  messages: Array<GroupMessage & {
    senderName: string;
    senderAvatar?: string;
  }>;
}
```

## Frontend Integration Flow

### 1. Plus Button Click Flow
```typescript
// ChatHeader.tsx
const handlePlusClick = () => {
  // Navigate to CreateGroupScreen
  navigation.navigate('CreateGroup');
};

// CreateGroupScreen.tsx
const CreateGroupScreen = () => {
  const [connections, setConnections] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');

  // Fetch connections
  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await api.get('/api/v1/connections');
      setConnections(response.data.connections);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const createGroup = async () => {
    try {
      const response = await api.post('/api/v1/groups', {
        name: groupName,
        memberIds: selectedMembers.map(member => member.id)
      });
      
      // Navigate to EditGroupScreen
      navigation.navigate('EditGroup', { groupId: response.data.group.id });
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    // UI for member selection and group creation
  );
};
```

### 2. Edit Group Flow
```typescript
// EditGroupScreen.tsx
const EditGroupScreen = ({ route }) => {
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const response = await api.get(`/api/v1/groups/${groupId}`);
      setGroup(response.data.group);
    } catch (error) {
      console.error('Error fetching group details:', error);
    }
  };

  const updateGroup = async (updates) => {
    try {
      const response = await api.put(`/api/v1/groups/${groupId}`, updates);
      setGroup(response.data.group);
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  return (
    // UI for editing group name and viewing members
  );
};
```

### 3. Group Chat Flow
```typescript
// GroupChatScreen.tsx
const GroupChatScreen = ({ route }) => {
  const { groupId } = route.params;
  const [messages, setMessages] = useState([]);
  const [group, setGroup] = useState(null);

  useEffect(() => {
    fetchGroupDetails();
    fetchMessages();
    joinGroupRoom();
  }, [groupId]);

  const joinGroupRoom = () => {
    socket.emit('join-group', { groupId });
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/api/v1/groups/${groupId}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (content) => {
    try {
      const response = await api.post(`/api/v1/groups/${groupId}/messages`, {
        content
      });
      // Message will be added via WebSocket
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    socket.on('group-message', (data) => {
      if (data.groupId === groupId) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    return () => {
      socket.off('group-message');
    };
  }, [groupId]);

  return (
    // Chat UI with messages and input
  );
};
```

## Error Handling

### Common Error Responses
```typescript
interface ErrorResponse {
  success: false;
  message: string;
  code: string;
}

// Common error codes:
// - GROUP_NOT_FOUND: Group doesn't exist
// - NOT_MEMBER: User is not a member of the group
// - NOT_ADMIN: User doesn't have admin permissions
// - MEMBER_LIMIT_EXCEEDED: Group is full (max 50 members)
// - INVALID_INPUT: Invalid request data
// - UNAUTHORIZED: Authentication required
```

### Frontend Error Handling Example
```typescript
const handleApiCall = async (apiFunction) => {
  try {
    const response = await apiFunction();
    return response.data;
  } catch (error) {
    if (error.response?.data?.code === 'NOT_MEMBER') {
      // Handle not member error
      navigation.navigate('Home');
    } else if (error.response?.data?.code === 'GROUP_NOT_FOUND') {
      // Handle group not found
      navigation.goBack();
    } else {
      // Show generic error
      showError(error.response?.data?.message || 'Something went wrong');
    }
  }
};
```

## Testing

### Run Backend Tests
```bash
cd backend
npm run test-group-chat
```

### Test Individual Endpoints
```bash
# Test with curl
curl -X GET "http://localhost:3000/api/v1/connections" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

curl -X POST "http://localhost:3000/api/v1/groups" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Group","memberIds":["uuid1","uuid2"]}'
```

## Deployment Notes

### Environment Variables
Ensure these are set in your backend environment:
```bash
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your_jwt_secret

# WebSocket
SOCKET_CORS_ORIGIN=http://localhost:3000
```

### Database Migrations
Run migrations to create group chat tables:
```bash
cd backend
npx sequelize-cli db:migrate
```

## Next Steps

1. **Frontend Implementation**: Implement the UI components using the provided API endpoints
2. **WebSocket Integration**: Connect to WebSocket events for real-time updates
3. **Testing**: Test all flows with real data
4. **Error Handling**: Implement proper error handling and user feedback
5. **Performance**: Optimize for large groups and message history

## Support

For any questions or issues with the backend implementation:
1. Check the test scripts in `src/scripts/testGroupChat.ts`
2. Review the detailed implementation in `GROUP_CHAT_IMPLEMENTATION.md`
3. Run the automated tests to verify functionality

The backend is now fully ready for frontend integration! 🚀
