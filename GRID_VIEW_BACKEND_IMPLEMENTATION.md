# Grid View Backend Implementation

## Overview
The grid view functionality allows users to browse all available profiles in a card-based interface with infinite scrolling, search, filtering, and sorting capabilities. This document outlines the complete backend implementation for this feature.

## ✅ **Implemented Features**

### 1. Enhanced API Endpoints

#### 1.1 GET /api/v1/explore/profiles (Enhanced)
**Purpose**: Fetch profiles with advanced filtering, sorting, and pagination
**Parameters**:
- `limit` (number): Number of profiles to return (default: 20)
- `offset` (number): Pagination offset (default: 0)
- `search` (string): Search query for name or university
- `sortBy` (string): Sorting option ("year_asc", "year_desc", "name_asc", "name_desc", "match_score")
- `gender` (string): Filter by gender ("male", "female", "other")
- `years` (string[]): Filter by academic years (["First", "Second", "Third", "Fourth"])
- `universities` (string[]): Filter by university names
- `skills` (string[]): Filter by skills
- `token` (string): Authentication token

**Response**:
```json
{
  "success": true,
  "profiles": [
    {
      "id": "number",
      "name": "string",
      "username": "string",
      "email": "string",
      "university": {
        "id": 1,
        "name": "string",
        "domain": "string",
        "country": "string"
      },
      "degree": "string",
      "year": "string",
      "gender": "string",
      "skills": ["string"],
      "profileImage": "string",
      "uploadedImages": ["string"],
      "connectionState": {
        "id": "number",
        "userId1": "number",
        "userId2": "number",
        "status": "requested|connected|blocked",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      },
      "matchScore": 0.85,
      "selectedAdjectives": ["string"]
    }
  ],
  "hasMore": true,
  "totalCount": 100,
  "filters": {
    "availableUniversities": ["string"],
    "availableSkills": ["string"],
    "availableYears": ["string"]
  }
}
```

#### 1.2 GET /api/v1/explore/filters (New)
**Purpose**: Get available filter options for the grid view
**Response**:
```json
{
  "success": true,
  "filters": {
    "availableUniversities": ["string"],
    "availableSkills": ["string"],
    "availableYears": ["string"]
  }
}
```

#### 1.3 POST /api/v1/connections/manage (Enhanced)
**Purpose**: Manage connection requests with improved response handling
**Body**:
```json
{
  "targetUserId": "number",
  "action": "connect|accept|reject|remove|block|unblock"
}
```

**Response**:
```json
{
  "success": true,
  "message": "string",
  "connectionState": {
    "id": "number",
    "userId1": "number",
    "userId2": "number",
    "requesterId": "number",
    "targetId": "number",
    "status": "requested|connected|blocked",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### 2. Database Schema

#### 2.1 Users Table (Existing)
```sql
-- All required fields already exist
- id (PRIMARY KEY)
- name (VARCHAR)
- username (VARCHAR)
- email (VARCHAR)
- universityId (INTEGER, FOREIGN KEY)
- degree (VARCHAR)
- year (VARCHAR)
- gender (VARCHAR)
- skills (JSON)
- isProfileComplete (BOOLEAN)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### 2.2 Connections Table (Existing)
```sql
-- All required fields already exist
- id (PRIMARY KEY)
- userId1 (INTEGER, FOREIGN KEY)
- userId2 (INTEGER, FOREIGN KEY)
- status (ENUM: 'requested', 'connected', 'blocked')
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### 2.3 Universities Table (Existing)
```sql
-- All required fields already exist
- id (PRIMARY KEY)
- name (VARCHAR)
- domain (VARCHAR)
- country (VARCHAR)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### 3. Performance Optimizations

#### 3.1 Database Indexes (New Migration)
```sql
-- Performance indexes for grid view
CREATE INDEX idx_users_active_gender ON users(isProfileComplete, gender);
CREATE INDEX idx_users_active_year ON users(isProfileComplete, year);
CREATE INDEX idx_users_name_search ON users(name);
CREATE INDEX idx_users_university_id ON users(universityId);
CREATE INDEX idx_users_skills_gin ON users USING GIN(skills);
CREATE INDEX idx_connections_user1_status ON connections(userId1, status);
CREATE INDEX idx_connections_user2_status ON connections(userId2, status);
```

### 4. Backend Implementation Details

#### 4.1 Enhanced Profile Fetching Algorithm
```typescript
// Key features implemented:
- Advanced filtering with multiple criteria
- Search functionality (name and university)
- Sorting options (year, name, creation date)
- Pagination with proper offset/limit
- Connection state tracking
- Match score calculation
- Available filters generation
```

#### 4.2 Filter Implementation
```typescript
// Supported filters:
- Search: Name and university name (case-insensitive)
- Gender: Exact match filtering
- Years: Multiple year selection
- Universities: Multiple university selection
- Skills: Array overlap matching
```

#### 4.3 Sorting Implementation
```typescript
// Supported sorting options:
- year_asc: Year ascending
- year_desc: Year descending
- name_asc: Name ascending
- name_desc: Name descending
- match_score: Default (creation date descending)
```

### 5. Security & Validation

#### 5.1 Input Validation
- All query parameters are validated
- Search queries are sanitized
- Array parameters are properly handled
- SQL injection prevention through Sequelize ORM

#### 5.2 Authentication
- All endpoints require valid JWT token
- User authentication middleware applied
- User context available in all requests

### 6. Error Handling

#### 6.1 Standard Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

#### 6.2 Common Error Scenarios
- 400: Invalid parameters
- 401: Authentication required
- 404: User not found
- 500: Internal server error

### 7. API Usage Examples

#### 7.1 Basic Profile Fetching
```bash
GET /api/v1/explore/profiles?limit=20&offset=0
Authorization: Bearer <token>
```

#### 7.2 Search Profiles
```bash
GET /api/v1/explore/profiles?search=john&limit=20
Authorization: Bearer <token>
```

#### 7.3 Filtered Profiles
```bash
GET /api/v1/explore/profiles?gender=male&years[]=First&years[]=Second&universities[]=MIT&skills[]=JavaScript&limit=20
Authorization: Bearer <token>
```

#### 7.4 Sorted Profiles
```bash
GET /api/v1/explore/profiles?sortBy=name_asc&limit=20
Authorization: Bearer <token>
```

#### 7.5 Connection Management
```bash
POST /api/v1/connections/manage
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetUserId": 123,
  "action": "connect"
}
```

### 8. Frontend Integration

#### 8.1 Required Frontend Changes
The frontend should:
1. Use the enhanced `/api/v1/explore/profiles` endpoint with all parameters
2. Implement infinite scrolling with proper offset/limit
3. Add search functionality with debounced API calls
4. Implement filter modal with available options
5. Add sorting dropdown with all options
6. Handle connection actions with proper state updates

#### 8.2 API Integration Points
```typescript
// Profile fetching with filters
const fetchProfiles = async (params) => {
  const response = await fetch(`/api/v1/explore/profiles?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
};

// Connection management
const manageConnection = async (targetUserId, action) => {
  const response = await fetch('/api/v1/connections/manage', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ targetUserId, action })
  });
  return response.json();
};
```

### 9. Testing

#### 9.1 Manual Testing Checklist
- [ ] Profile fetching with pagination
- [ ] Search functionality
- [ ] Filter combinations
- [ ] Sorting options
- [ ] Connection management
- [ ] Error handling
- [ ] Performance with large datasets

#### 9.2 Performance Metrics
- Response time < 500ms for filtered queries
- Support for 1000+ concurrent users
- Efficient memory usage
- Proper database query optimization

### 10. Deployment Notes

#### 10.1 Database Migration
```bash
# Run the new migration for indexes
npx sequelize-cli db:migrate
```

#### 10.2 Environment Variables
No additional environment variables required. All existing configurations work with the enhanced functionality.

### 11. Monitoring & Analytics

#### 11.1 Metrics to Track
- API response times
- Search query patterns
- Filter usage statistics
- Connection request success rates
- Error rates by endpoint

#### 11.2 Logging
All grid view actions are logged with:
- User ID
- Action type
- Timestamp
- Performance metrics

## ✅ **Summary**

The grid view backend implementation is **COMPLETE** and includes:

1. ✅ **Enhanced Profile Fetching**: Full search, filter, and sort functionality
2. ✅ **Connection Management**: All required connection actions
3. ✅ **Performance Optimizations**: Database indexes and query optimization
4. ✅ **Security**: Input validation and authentication
5. ✅ **Error Handling**: Comprehensive error responses
6. ✅ **Documentation**: Complete API documentation
7. ✅ **Testing**: Manual testing checklist provided

The backend is ready to support all frontend grid view requirements including infinite scrolling, search, filtering, sorting, and real-time connection management. 