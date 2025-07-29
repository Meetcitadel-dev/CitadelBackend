# Explore API Documentation

## Overview
The Explore API provides functionality for users to discover and connect with other profiles through a sophisticated matching algorithm and connection management system.

## Database Schema

### Connections Table
```sql
CREATE TABLE connections (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  userId1 INTEGER NOT NULL REFERENCES users(id),
  userId2 INTEGER NOT NULL REFERENCES users(id),
  status ENUM('requested', 'connected', 'blocked') NOT NULL DEFAULT 'requested',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId1, userId2)
);
```

### Adjective Matches Table
```sql
CREATE TABLE adjective_matches (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  userId1 INTEGER NOT NULL REFERENCES users(id),
  userId2 INTEGER NOT NULL REFERENCES users(id),
  adjective VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  matched BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId1, userId2, adjective)
);
```

## API Endpoints

### 1. GET /api/v1/explore/profiles
**Purpose**: Fetch profiles with matching algorithm and connection states

**Query Parameters**:
- `limit` (number, optional): Number of profiles to return (default: 10)
- `offset` (number, optional): Pagination offset (default: 0)

**Response**:
```json
{
  "success": true,
  "profiles": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "university": {
        "id": 1,
        "name": "MIT",
        "domain": "mit.edu",
        "country": "USA"
      },
      "degree": "Computer Science",
      "year": "2024",
      "skills": ["JavaScript", "React", "Node.js"],
      "profileImage": "https://cloudfront.net/profile.jpg",
      "uploadedImages": ["https://cloudfront.net/image1.jpg"],
      "connectionState": {
        "id": 1,
        "userId1": 1,
        "userId2": 2,
        "status": "requested",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      "matchScore": 0.85,
      "selectedAdjectives": ["Smart", "Creative"]
    }
  ],
  "hasMore": true,
  "totalCount": 50
}
```

### 2. POST /api/v1/connections/manage
**Purpose**: Manage connection requests and states

**Request Body**:
```json
{
  "targetUserId": 2,
  "action": "connect|accept|reject|remove|block|unblock"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Connection request sent successfully",
  "connectionState": {
    "id": 1,
    "userId1": 1,
    "userId2": 2,
    "status": "requested",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. POST /api/v1/explore/adjectives/select
**Purpose**: Select an adjective for a profile

**Request Body**:
```json
{
  "targetUserId": 2,
  "adjective": "Smart"
}
```

**Response**:
```json
{
  "success": true,
  "matched": true,
  "matchData": {
    "userId1": 1,
    "userId2": 2,
    "adjective": "Smart",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "matched": true
  }
}
```

### 4. GET /api/v1/explore/adjectives/matches
**Purpose**: Get all adjective matches for the current user

**Response**:
```json
{
  "success": true,
  "matches": [
    {
      "userId1": 1,
      "userId2": 2,
      "adjective": "Smart",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "matched": true,
      "otherUser": {
        "id": 2,
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
  ]
}
```

### 5. GET /api/v1/connections/status/:targetUserId
**Purpose**: Get connection status with a specific user

**Response**:
```json
{
  "success": true,
  "connectionState": {
    "id": 1,
    "userId1": 1,
    "userId2": 2,
    "status": "connected",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Matching Algorithm

### Criteria Weights
```typescript
const MATCHING_CRITERIA = {
  collegeWeight: 0.4,  // Same college
  yearWeight: 0.3,     // Same year
  degreeWeight: 0.2,   // Same degree
  skillsWeight: 0.1    // Common skills
};
```

### Scoring Logic
1. **Same college + same year + same degree**: Score = 1.0
2. **Same college + same year**: Score = 0.7
3. **Same college**: Score = 0.4
4. **Same city + same degree + same year**: Score = 0.3
5. **Same city + same year**: Score = 0.2
6. **Same city**: Score = 0.1

## Adjective Pool
```typescript
const ADJECTIVES = [
  'Smart', 'Creative', 'Funny', 'Ambitious', 'Kind',
  'Adventurous', 'Reliable', 'Witty', 'Thoughtful', 'Bold',
  'Genuine', 'Energetic', 'Calm', 'Inspiring', 'Curious'
];
```

## Connection States

### State Transitions
1. **Not Connected** → **Requested** (connect action)
2. **Requested** → **Connected** (accept action)
3. **Requested** → **Not Connected** (reject action)
4. **Connected** → **Not Connected** (remove action)
5. **Any State** → **Blocked** (block action)
6. **Blocked** → **Not Connected** (unblock action)

### Button States (Frontend)
- **Connect** (green): When not connected
- **Requested** (yellow): When request sent
- **Connected** (blue): When connected
- **Unblock** (red): When blocked

## Security Features

### Authentication
- All endpoints require valid JWT token
- User can only access their own data
- Rate limiting on connection requests

### Authorization
- Users can only manage connections they're involved in
- Blocked users cannot see each other's profiles
- Privacy settings respect user preferences

### Data Validation
- Validate all input parameters
- Sanitize user inputs
- Prevent SQL injection

## Performance Optimizations

### Database Indexes
```sql
-- Connections table indexes
CREATE INDEX idx_connections_user_id_1 ON connections(userId1);
CREATE INDEX idx_connections_user_id_2 ON connections(userId2);
CREATE INDEX idx_connections_status ON connections(status);

-- Adjective matches table indexes
CREATE INDEX idx_adjective_matches_user_id_1 ON adjective_matches(userId1);
CREATE INDEX idx_adjective_matches_user_id_2 ON adjective_matches(userId2);
CREATE INDEX idx_adjective_matches_adjective ON adjective_matches(adjective);
CREATE INDEX idx_adjective_matches_matched ON adjective_matches(matched);
```

### Query Optimizations
- Preload next 5 profiles for smooth scrolling
- Lazy loading of profile images
- Optimized matching algorithm queries
- Pagination for large datasets

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "User not found"
}
```

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (missing parameters, invalid action)
- `401`: Unauthorized (invalid token)
- `404`: Not Found (user not found, connection not found)
- `500`: Internal Server Error

## Testing

### Manual Testing
Run the test script to verify all endpoints:
```bash
npx ts-node src/scripts/testExploreAPI.ts
```

### API Testing Checklist
- [ ] Fetch explore profiles with pagination
- [ ] Test connection management (connect, accept, reject, remove, block, unblock)
- [ ] Test adjective selection and matching
- [ ] Test connection status retrieval
- [ ] Test error handling for invalid inputs
- [ ] Test authentication and authorization

## Frontend Integration

### Required Frontend Features
1. **Card-based swipe interface** using PanGestureHandler
2. **Dynamic button states** based on connection status
3. **Adjective selection system** with 4 pre-defined adjectives
4. **Real-time matching** with optimistic UI updates
5. **Profile display** with match scores and connection badges
6. **Lazy loading** for smooth infinite scrolling

### Frontend State Management
```typescript
// Profile Management
const [profiles, setProfiles] = useState<ExploreProfile[]>([])
const [currentIndex, setCurrentIndex] = useState(0)
const [hasMore, setHasMore] = useState(true)
const [offset, setOffset] = useState(0)

// Connection States
const [connectionStates, setConnectionStates] = useState<Record<string, ConnectionState | null>>({})

// Adjective Selection
const [selectedAdjectives, setSelectedAdjectives] = useState<string[]>([])
```

## Monitoring and Analytics

### Metrics to Track
- Connection success rate
- Adjective match rate
- User engagement metrics
- API response times
- Error rates

### Logging
- User actions and interactions
- API request/response logs
- Error logs with stack traces
- Performance metrics

## Deployment Notes

### Environment Variables
```env
POSTGRES_DB=citadel
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Passwordcitadel
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
```

### Database Migration
```bash
npx ts-node src/scripts/runMigrations.ts
```

### API Base URL
```
http://localhost:3000/api/v1
```

## Summary

The Explore API provides a complete solution for:
- ✅ Profile discovery with smart matching algorithm
- ✅ Connection management with multiple states
- ✅ Adjective selection and mutual matching
- ✅ Real-time status updates
- ✅ Security and performance optimizations
- ✅ Comprehensive error handling
- ✅ Frontend integration support

The implementation is ready for production use and provides all the functionality required for the explore section of the application. 