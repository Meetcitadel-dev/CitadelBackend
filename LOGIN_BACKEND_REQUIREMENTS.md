# Login Backend Requirements - Citadel App

## Overview
This document outlines the backend requirements for implementing the login functionality in the Citadel application.

## API Endpoints

### 1. Check User Existence
**Endpoint:** `POST /api/v1/auth/check-user`

**Purpose:** Verify if a user exists in the database before allowing login

**Request Body:**
```json
{
  "email": "user@university.edu"
}
```

**Response (User Exists):**
```json
{
  "success": true,
  "message": "User exists and can proceed with login",
  "user": {
    "id": 1,
    "email": "user@university.edu",
    "isProfileComplete": true
  }
}
```

**Response (User Not Found):**
```json
{
  "success": false,
  "message": "User not found. Please sign up first."
}
```

**Response (Invalid Email):**
```json
{
  "success": false,
  "message": "Invalid university email domain"
}
```

### 2. Send OTP (Enhanced)
**Endpoint:** `POST /api/v1/auth/send-otp`

**Purpose:** Send OTP for both signup and login flows

**Request Body:**
```json
{
  "email": "user@university.edu",
  "isLogin": true  // Optional, defaults to false
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

### 3. Verify OTP (Enhanced)
**Endpoint:** `POST /api/v1/auth/verify-otp`

**Purpose:** Verify OTP and return user data with JWT tokens

**Request Body:**
```json
{
  "email": "user@university.edu",
  "otp": "123456",
  "isLogin": true  // Optional, defaults to false
}
```

**Response:**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "jwt_access_token_here",
    "refreshToken": "jwt_refresh_token_here"
  },
  "user": {
    "id": 1,
    "email": "user@university.edu",
    "name": "John Doe",
    "username": "johndoe",
    "universityId": 1,
    "degree": "Computer Science",
    "year": "3rd Year",
    "gender": "Male",
    "dateOfBirth": "1995-01-01T00:00:00.000Z",
    "skills": ["JavaScript", "React", "Node.js"],
    "friends": ["friend1@university.edu", "friend2@university.edu"],
    "aboutMe": "I love coding and meeting new people",
    "sports": "Basketball, Football",
    "movies": "Inception, The Dark Knight",
    "tvShows": "Breaking Bad, Game of Thrones",
    "teams": "Lakers, Manchester United",
    "portfolioLink": "https://portfolio.com",
    "phoneNumber": "+1234567890",
    "isProfileComplete": true,
    "isEmailVerified": true
  }
}
```

## Key Features Implemented

### ✅ Email Validation
- Validates university email domains (.edu, .org)
- Checks against allowed university domains in database
- Prevents non-university emails from accessing the system

### ✅ User Existence Verification
- Checks if user exists before allowing login
- Returns appropriate error messages for non-existent users
- Validates email verification status

### ✅ OTP Generation and Verification
- Generates secure 6-digit OTP codes
- Implements rate limiting for OTP requests
- Verifies OTP with expiration handling
- Prevents brute force attacks

### ✅ JWT Token Generation
- Generates access tokens (5 days expiry)
- Generates refresh tokens (7 days expiry)
- Includes user information in token payload
- Supports token refresh functionality

### ✅ Rate Limiting
- Implements rate limiting for OTP requests
- Prevents spam and abuse
- Configurable limits per endpoint

### ✅ Proper Error Handling
- Comprehensive error messages
- Appropriate HTTP status codes
- Detailed logging for debugging

### ✅ Database Integration
- Uses Sequelize ORM
- Proper model associations
- Transaction handling for data integrity

## Security Features

### 🔒 Input Validation
- Email format validation
- University domain verification
- OTP format validation

### 🔒 Rate Limiting
- OTP request rate limiting
- Configurable limits and windows
- IP-based rate limiting

### 🔒 JWT Security
- Secure token generation
- Token expiration handling
- Refresh token rotation

### 🔒 Database Security
- SQL injection prevention
- Parameterized queries
- Input sanitization

## Database Schema Requirements

### User Model Fields
- `id` (Primary Key)
- `email` (Unique, Required)
- `isEmailVerified` (Boolean)
- `otpAttempts` (Integer)
- `name` (String)
- `username` (String, Unique)
- `universityId` (Foreign Key)
- `degree` (String)
- `year` (String)
- `gender` (String)
- `dateOfBirth` (Date)
- `skills` (JSON Array)
- `friends` (JSON Array)
- `aboutMe` (Text)
- `sports` (String)
- `movies` (String)
- `tvShows` (String)
- `teams` (String)
- `portfolioLink` (String)
- `phoneNumber` (String)
- `isProfileComplete` (Boolean)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

## Environment Variables Required

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=citadel_db
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your_jwt_secret_here

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Redis (for OTP storage)
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development
```

## Testing Requirements

### Unit Tests
- Email validation tests
- OTP generation and verification tests
- JWT token generation tests
- User existence checks

### Integration Tests
- Complete login flow testing
- Error handling scenarios
- Rate limiting tests
- Database integration tests

### API Tests
- Endpoint response validation
- Request/response format validation
- Error code validation
- Performance testing

## Deployment Considerations

### Production Setup
- Use environment variables for all secrets
- Implement proper logging
- Set up monitoring and alerting
- Configure rate limiting for production
- Use HTTPS in production

### Security Checklist
- [ ] JWT secret is properly secured
- [ ] Rate limiting is configured
- [ ] Input validation is implemented
- [ ] Error messages don't leak sensitive info
- [ ] Database connections are secured
- [ ] HTTPS is enabled in production

## Frontend Integration

### API Calls Required
1. `POST /api/v1/auth/check-user` - Check user existence
2. `POST /api/v1/auth/send-otp` - Send OTP for login
3. `POST /api/v1/auth/verify-otp` - Verify OTP and get tokens

### Token Storage
- Store access token in memory or secure storage
- Store refresh token in secure HTTP-only cookie
- Implement automatic token refresh

### Error Handling
- Handle network errors gracefully
- Display user-friendly error messages
- Implement retry mechanisms for failed requests

## Implementation Status

### ✅ Completed
- [x] Check user existence endpoint
- [x] Enhanced send OTP endpoint
- [x] Enhanced verify OTP endpoint
- [x] JWT token generation
- [x] Email validation
- [x] Rate limiting
- [x] Error handling
- [x] Database integration

### 🔄 In Progress
- [ ] Comprehensive testing
- [ ] Production deployment setup
- [ ] Monitoring and logging

### 📋 Pending
- [ ] Performance optimization
- [ ] Advanced security features
- [ ] Analytics integration 