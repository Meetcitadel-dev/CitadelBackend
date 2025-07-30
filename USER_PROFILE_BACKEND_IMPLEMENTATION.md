# User Profile Backend Implementation

## Overview
This document outlines the backend implementation for the new user profile functionality that allows users to view other users' profiles at `/{name}` route.

## ✅ Implemented Features

### 1. Database Schema Updates

#### 1.1 Username Field Migration
- **File:** `backend/migrations/20250103000000-add-username-field.js`
- **Purpose:** Adds unique username field to users table for URL routing
- **Features:**
  - Unique constraint on username field
  - Index for faster lookups
  - 50 character limit

#### 1.2 User Model Updates
- **File:** `backend/src/models/user.model.ts`
- **Updates:**
  - Added `username` field to UserAttributes interface
  - Added username field to User class
  - Added username field definition with unique constraint

### 2. API Endpoints

#### 2.1 Get User Profile by Username
- **Endpoint:** `GET /api/v1/users/{username}`
- **Controller:** `backend/src/controllers/userProfile.controller.ts`
- **Features:**
  - Fetch user profile by username
  - Hide sensitive data (email, phone) for non-own profiles
  - Include connection status between users
  - Include friends count and mutual friends count
  - Generate fresh signed URLs for images
  - Proper error handling

#### 2.2 Get Mutual Friends
- **Endpoint:** `GET /api/v1/users/{username}/mutual-friends`
- **Controller:** `backend/src/controllers/userProfile.controller.ts`
- **Features:**
  - Calculate mutual friends between current user and target user
  - Return detailed mutual friends list with profile images
  - Efficient database queries using intersections

#### 2.3 Update Username
- **Endpoint:** `PUT /api/v1/users/username`
- **Controller:** `backend/src/controllers/userProfile.controller.ts`
- **Features:**
  - Username validation (3-20 characters, alphanumeric + underscore)
  - Check for username uniqueness
  - Update user's username

### 3. Routes Configuration

#### 3.1 User Profile Routes
- **File:** `backend/src/routes/userProfile.routes.ts`
- **Routes:**
  - `GET /:username` - Get user profile by username
  - `GET /:username/mutual-friends` - Get mutual friends list
  - `PUT /username` - Update user's username

#### 3.2 App Integration
- **File:** `backend/src/app.ts`
- **Integration:** Added user profile routes to main app

### 4. Utility Functions

#### 4.1 Username Generation
- **Function:** `generateUsername(name: string)`
- **Features:**
  - Converts name to lowercase, removes special characters
  - Ensures uniqueness by adding counter if needed
  - Used in onboarding and username generation script

#### 4.2 Username Generation Script
- **File:** `backend/src/scripts/generateUsernames.ts`
- **Purpose:** Generate usernames for existing users
- **Features:**
  - Finds users without usernames
  - Generates usernames from names or emails
  - Batch processing for existing data

### 5. Integration Updates

#### 5.1 Profile Controller Updates
- **File:** `backend/src/controllers/profile.controller.ts`
- **Updates:**
  - Include username in profile responses
  - Maintain backward compatibility

#### 5.2 Explore Controller Updates
- **File:** `backend/src/controllers/explore.controller.ts`
- **Updates:**
  - Include username in explore profile responses
  - Maintain consistency across all profile endpoints

#### 5.3 Onboarding Controller Updates
- **File:** `backend/src/controllers/onboarding.controller.ts`
- **Updates:**
  - Generate username when user completes onboarding
  - Include username in onboarding response

## 🔧 Database Queries

### 1. Mutual Friends Calculation
```sql
-- Get current user's connections
SELECT userId1, userId2 FROM connections 
WHERE (userId1 = ? OR userId2 = ?) AND status = 'connected';

-- Get target user's connections  
SELECT userId1, userId2 FROM connections
WHERE (userId1 = ? OR userId2 = ?) AND status = 'connected';

-- Find intersection in application code
```

### 2. Connection Status Check
```sql
-- Check for existing connection
SELECT * FROM connections 
WHERE (userId1 = ? AND userId2 = ?) OR (userId1 = ? AND userId2 = ?);

-- Check for connection requests
SELECT * FROM connection_requests
WHERE (requesterId = ? AND targetId = ?) OR (requesterId = ? AND targetId = ?);
```

## 🚀 Performance Optimizations

### 1. Database Indexes
- Username field indexed for fast lookups
- Connection table indexes for efficient mutual friends queries
- User ID indexes for profile lookups

### 2. Caching Strategy
- Fresh signed URLs generated on each request
- Connection status cached in application layer
- Mutual friends calculation optimized with set operations

### 3. Query Optimization
- Efficient mutual friends calculation using array intersections
- Minimal database queries per request
- Proper use of Sequelize associations

## 🔒 Security Features

### 1. Data Privacy
- Email and phone number hidden for non-own profiles
- Profile visibility controlled by authentication
- Connection status properly validated

### 2. Input Validation
- Username format validation (3-20 chars, alphanumeric + underscore)
- Unique username enforcement
- Proper error handling for invalid usernames

### 3. Authentication
- All routes protected by authentication middleware
- User context properly validated
- Secure connection status checks

## 📊 API Response Formats

### 1. User Profile Response
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "number",
    "name": "string",
    "username": "string",
    "email": "string", // Only for own profile
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
    "phoneNumber": "string", // Only for own profile
    "friendsCount": "number",
    "mutualFriendsCount": "number",
    "connectionState": {
      "id": "string",
      "status": "connected|requested|not_connected|blocked",
      "requesterId": "string",
      "targetId": "string",
      "createdAt": "string",
      "updatedAt": "string"
    },
    "images": [
      {
        "id": "string",
        "cloudfrontUrl": "string"
      }
    ]
  }
}
```

### 2. Mutual Friends Response
```json
{
  "success": true,
  "message": "Mutual friends retrieved successfully",
  "data": {
    "mutualFriends": [
      {
        "id": "string",
        "name": "string",
        "username": "string",
        "profileImage": "string"
      }
    ],
    "totalCount": "number"
  }
}
```

## 🧪 Testing Requirements

### 1. Unit Tests Needed
- Username generation and validation
- Mutual friends calculation
- Connection status determination
- Profile data filtering (own vs other profiles)

### 2. Integration Tests Needed
- End-to-end profile viewing
- Username update functionality
- Mutual friends API
- Error handling scenarios

### 3. Performance Tests Needed
- Profile loading with large friend lists
- Mutual friends calculation with many connections
- Database query optimization

## 📈 Monitoring and Analytics

### 1. Metrics to Track
- Profile view counts by username
- Username update frequency
- Mutual friends calculation performance
- API response times

### 2. Error Tracking
- Invalid username attempts
- Profile not found errors
- Database query failures

## 🔄 Migration Steps

### 1. Database Migration
```bash
# Run the username field migration
npx sequelize-cli db:migrate
```

### 2. Generate Usernames for Existing Users
```bash
# Run the username generation script
npx ts-node src/scripts/generateUsernames.ts
```

### 3. Verify Implementation
- Test all new API endpoints
- Verify username uniqueness
- Check mutual friends calculation
- Validate profile privacy settings

## 🎯 Frontend Integration Points

### 1. API Endpoints for Frontend
- `GET /api/v1/users/{username}` - Main profile endpoint
- `GET /api/v1/users/{username}/mutual-friends` - Mutual friends list
- `PUT /api/v1/users/username` - Update username

### 2. Expected Frontend Behavior
- Navigate to `/{username}` for user profiles
- Show "Message" button instead of "Edit Profile" for other users
- Display friends count and mutual friends count
- Handle connection status badges
- Implement proper loading states

### 3. Error Handling
- 404 for non-existent usernames
- 400 for invalid username formats
- 401 for unauthenticated requests
- 500 for server errors

## ✅ Implementation Status

- [x] Database migration for username field
- [x] User model updates
- [x] User profile controller
- [x] Mutual friends functionality
- [x] Username generation utilities
- [x] Route configuration
- [x] Integration with existing controllers
- [x] Security and privacy features
- [x] Error handling
- [x] Documentation

## 🚀 Next Steps

1. **Run Migrations:** Execute the database migration to add username field
2. **Generate Usernames:** Run the username generation script for existing users
3. **Test Endpoints:** Verify all new API endpoints work correctly
4. **Frontend Integration:** Coordinate with frontend team for integration
5. **Performance Testing:** Monitor API performance and optimize if needed
6. **User Testing:** Gather feedback and iterate on features

## 📝 Notes

- All existing functionality remains backward compatible
- Username generation is automatic for new users during onboarding
- Mutual friends calculation is optimized for performance
- Profile privacy is properly implemented
- Error handling follows consistent patterns
- Documentation is comprehensive for frontend integration 