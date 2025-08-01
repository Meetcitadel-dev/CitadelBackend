# Friends and Mutuals Implementation

## Overview
This document outlines the implementation of the friends and mutuals functionality in the user profile system. The implementation correctly shows actual connection counts instead of onboarding preferences.

## ✅ Changes Made

### 1. Backend Changes

#### 1.1 Updated User Profile Controller (`backend/src/controllers/userProfile.controller.ts`)

**Field Name Changes:**
- `friendsCount` → `connectionsCount`
- `mutualFriendsCount` → `mutualConnectionsCount`
- `friends` → `connections`

**New Response Structure:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "university": {
      "id": "number",
      "name": "string",
      "domain": "string",
      "country": "string"
    },
    "degree": "string",
    "year": "string",
    "skills": ["string"],
    "aboutMe": "string",
    "sports": "string",
    "movies": "string",
    "tvShows": "string",
    "teams": "string",
    "portfolioLink": "string",
    "phoneNumber": "string",
    "connections": [
      {
        "id": "string",
        "name": "string"
      }
    ],
    "connectionsCount": 5,
    "mutualConnectionsCount": 2,
    "connectionState": {
      "id": "string",
      "status": "connected|requested|not_connected|blocked",
      "requesterId": "string",
      "targetId": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

#### 1.2 Updated Mutual Friends Endpoint

**Response Structure:**
```json
{
  "success": true,
  "message": "Mutual connections retrieved successfully",
  "data": {
    "mutualConnections": [
      {
        "id": "string",
        "name": "string",
        "username": "string",
        "profileImage": "string"
      }
    ],
    "totalCount": 2
  }
}
```

### 2. Business Logic

#### 2.1 Connections Count Calculation
```javascript
// Get total connections for a user
const connectionsCount = await Connection.count({
  where: {
    [Op.or]: [
      { userId1: user.id, status: 'connected' },
      { userId2: user.id, status: 'connected' }
    ]
  }
});
```

#### 2.2 Mutual Connections Calculation
```javascript
// Get mutual connections between two users
const currentUserConnections = await Connection.findAll({
  where: {
    [Op.or]: [
      { userId1: currentUserId, status: 'connected' },
      { userId2: currentUserId, status: 'connected' }
    ]
  }
});

const targetUserConnections = await Connection.findAll({
  where: {
    [Op.or]: [
      { userId1: user.id, status: 'connected' },
      { userId2: user.id, status: 'connected' }
    ]
  }
});

// Find intersection of connection IDs
const currentUserConnectionIds = currentUserConnections.map(conn => 
  conn.userId1 === currentUserId ? conn.userId2 : conn.userId1
);

const targetUserConnectionIds = targetUserConnections.map(conn => 
  conn.userId1 === user.id ? conn.userId2 : conn.userId1
);

const mutualConnectionIds = currentUserConnectionIds.filter(id => 
  targetUserConnectionIds.includes(id)
);

const mutualConnectionsCount = mutualConnectionIds.length;
```

#### 2.3 Actual Connections Data
```javascript
// Get actual connections with user details
const userConnections = await Connection.findAll({
  where: {
    [Op.or]: [
      { userId1: user.id, status: 'connected' },
      { userId2: user.id, status: 'connected' }
    ]
  },
  include: [
    {
      model: User,
      as: 'user1',
      attributes: ['id', 'name', 'username']
    },
    {
      model: User,
      as: 'user2',
      attributes: ['id', 'name', 'username']
    }
  ]
});

// Format connections data
const connections = userConnections.map(conn => {
  const isUser1 = conn.userId1 === user.id;
  const connectedUser = isUser1 ? conn.userId2 : conn.userId1;
  const connectedUserData = isUser1 ? conn.user2 : conn.user1;
  return {
    id: connectedUser,
    name: connectedUserData?.name || 'Unknown User'
  };
});
```

### 3. Database Schema

#### 3.1 Connections Table
```sql
CREATE TABLE connections (
  id SERIAL PRIMARY KEY,
  userId1 INTEGER NOT NULL,
  userId2 INTEGER NOT NULL,
  status ENUM('requested', 'connected', 'blocked') NOT NULL DEFAULT 'requested',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId1, userId2),
  FOREIGN KEY (userId1) REFERENCES users(id),
  FOREIGN KEY (userId2) REFERENCES users(id)
);
```

#### 3.2 Indexes
```sql
-- Unique constraint on user pairs
CREATE UNIQUE INDEX idx_connections_user_pair ON connections(userId1, userId2);

-- Indexes for fast lookups
CREATE INDEX idx_connections_userId1 ON connections(userId1);
CREATE INDEX idx_connections_userId2 ON connections(userId2);
CREATE INDEX idx_connections_status ON connections(status);
```

### 4. API Endpoints

#### 4.1 Get User Profile
- **Endpoint:** `GET /api/v1/users/{username}`
- **Authentication:** Required
- **Response:** User profile with connection counts and mutual connection counts

#### 4.2 Get Mutual Connections
- **Endpoint:** `GET /api/v1/users/{username}/mutual-friends`
- **Authentication:** Required
- **Response:** List of mutual connections between current user and target user

### 5. Testing

#### 5.1 Test Script
Created `backend/src/scripts/testFriendsMutuals.ts` to verify the implementation.

**Usage:**
```bash
cd backend
npm run ts-node src/scripts/testFriendsMutuals.ts
```

**Test Cases:**
1. Verify `connectionsCount` field is present and correct
2. Verify `mutualConnectionsCount` field is present and correct
3. Verify `connections` array contains actual connection data
4. Verify mutual connections endpoint returns correct data

### 6. Frontend Integration

#### 6.1 Expected Frontend Changes
The frontend should expect these field names:
- `connectionsCount` instead of `friendsCount`
- `mutualConnectionsCount` instead of `mutualFriendsCount`
- `connections` array instead of `friends` array
- `mutualConnections` array instead of `mutualFriends` array

#### 6.2 Frontend API Interface
```typescript
interface UserProfile {
  id: string;
  name: string;
  email?: string;
  university?: {
    id: number;
    name: string;
    domain: string;
    country: string;
  };
  degree?: string;
  year?: string;
  skills?: string[];
  aboutMe?: string;
  sports?: string;
  movies?: string;
  tvShows?: string;
  teams?: string;
  portfolioLink?: string;
  phoneNumber?: string;
  connections: Array<{
    id: string;
    name: string;
  }>;
  connectionsCount: number;
  mutualConnectionsCount: number;
  connectionState?: {
    id: string;
    status: 'connected' | 'requested' | 'not_connected' | 'blocked';
    requesterId: string;
    targetId: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

### 7. Performance Considerations

#### 7.1 Database Queries
- Uses efficient `COUNT()` queries for connection counts
- Uses indexed lookups for connection data
- Minimizes database round trips

#### 7.2 Caching Strategy
- Consider caching connection counts for frequently accessed users
- Cache mutual connections for user pairs
- Implement cache invalidation on connection status changes

### 8. Security Considerations

#### 8.1 Data Privacy
- Only show mutual connections if both users are connected
- Respect user privacy settings
- Validate user permissions for connection data

#### 8.2 Rate Limiting
- Implement rate limiting on profile view endpoints
- Prevent connection enumeration attacks
- Use proper authentication checks

### 9. Migration Notes

#### 9.1 Backward Compatibility
- The old `friends` field from onboarding is still available in the user model
- New `connections` field provides actual connection data
- Frontend can gradually migrate to new field names

#### 9.2 Database Migration
- No database schema changes required
- Existing connections table is used
- Existing indexes support the new queries

### 10. Monitoring and Analytics

#### 10.1 Metrics to Track
- Connection count accuracy
- Mutual connections calculation time
- API response times for profile endpoints
- Error rates in connection logic

#### 10.2 Logging
- Log connection count queries
- Log mutual connections calculations
- Monitor performance bottlenecks
- Track API usage patterns

## Summary

The implementation now correctly shows:
1. **Friends Count**: Actual number of connections the user has
2. **Mutuals Count**: Number of common connections between current user and profile being viewed
3. **Actual Connection Data**: Real connection information instead of onboarding preferences

The backend is now ready to work with the frontend changes that expect the new field names (`connectionsCount`, `mutualConnectionsCount`, `connections`, `mutualConnections`). 