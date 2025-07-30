# Frontend Integration Guide - Login Functionality

## Overview
This guide provides the frontend team with all the necessary information to integrate with the login API endpoints.

## API Endpoints Summary

### 1. Check User Existence
**Endpoint:** `POST /api/v1/auth/check-user`

**Use Case:** Call this when user enters email on login screen to verify if they exist.

**Request:**
```javascript
const response = await fetch('/api/v1/auth/check-user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@university.edu'
  })
});
```

**Response Handling:**
```javascript
const data = await response.json();

if (data.success) {
  // User exists, proceed to OTP screen
  navigateToOTPScreen();
} else {
  // Show error message
  showError(data.message);
}
```

### 2. Send OTP for Login
**Endpoint:** `POST /api/v1/auth/send-otp`

**Use Case:** Send OTP after confirming user exists.

**Request:**
```javascript
const response = await fetch('/api/v1/auth/send-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@university.edu',
    isLogin: true  // Important: Set this to true for login flow
  })
});
```

**Response Handling:**
```javascript
const data = await response.json();

if (data.success) {
  // OTP sent successfully, show OTP input screen
  showOTPInputScreen();
  startOTPTimer(data.expiresIn); // Optional: Show countdown timer
} else {
  // Show error message
  showError(data.message);
}
```

### 3. Verify OTP and Login
**Endpoint:** `POST /api/v1/auth/verify-otp`

**Use Case:** Verify OTP and complete login process.

**Request:**
```javascript
const response = await fetch('/api/v1/auth/verify-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@university.edu',
    otp: '123456',
    isLogin: true  // Important: Set this to true for login flow
  })
});
```

**Response Handling:**
```javascript
const data = await response.json();

if (data.success) {
  // Store tokens
  localStorage.setItem('accessToken', data.tokens.accessToken);
  localStorage.setItem('refreshToken', data.tokens.refreshToken);
  
  // Store user data
  localStorage.setItem('user', JSON.stringify(data.user));
  
  // Navigate to explore page
  navigateToExplorePage();
} else {
  // Show error message
  showError(data.message);
}
```

## Complete Login Flow Implementation

### Step 1: Login Email Screen
```javascript
// login-email-screen.tsx
const handleEmailSubmit = async (email) => {
  try {
    // Step 1: Check if user exists
    const checkResponse = await fetch('/api/v1/auth/check-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const checkData = await checkResponse.json();
    
    if (!checkData.success) {
      showError(checkData.message);
      return;
    }
    
    // Step 2: Send OTP
    const otpResponse = await fetch('/api/v1/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, isLogin: true })
    });
    
    const otpData = await otpResponse.json();
    
    if (otpData.success) {
      // Navigate to OTP screen
      navigateToOTPScreen(email);
    } else {
      showError(otpData.message);
    }
  } catch (error) {
    showError('Network error. Please try again.');
  }
};
```

### Step 2: OTP Verification Screen
```javascript
// otp-screen.tsx
const handleOTPSubmit = async (otp) => {
  try {
    const response = await fetch('/api/v1/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: userEmail, 
        otp, 
        isLogin: true 
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store authentication data
      storeAuthData(data);
      
      // Navigate to explore page
      navigateToExplorePage();
    } else {
      showError(data.message);
    }
  } catch (error) {
    showError('Network error. Please try again.');
  }
};

const storeAuthData = (data) => {
  // Store tokens
  localStorage.setItem('accessToken', data.tokens.accessToken);
  localStorage.setItem('refreshToken', data.tokens.refreshToken);
  
  // Store user data
  localStorage.setItem('user', JSON.stringify(data.user));
  
  // Set authentication state
  setAuthState({
    isAuthenticated: true,
    user: data.user,
    tokens: data.tokens
  });
};
```

## Error Handling

### Common Error Messages
```javascript
const errorMessages = {
  'Email is required': 'Please enter your email address',
  'Invalid university email domain': 'Please use your university email address',
  'User not found. Please sign up first.': 'No account found. Please sign up first.',
  'Email not verified. Please complete email verification first.': 'Please complete email verification first.',
  'Invalid or expired OTP': 'Invalid OTP. Please try again.',
  'OTP sent successfully': 'OTP sent to your email',
  'User exists and can proceed with login': 'Proceeding to login...'
};
```

### Error Handling Function
```javascript
const handleAPIError = (error) => {
  if (error.response) {
    const { data } = error.response;
    return data.message || 'An error occurred';
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return 'An unexpected error occurred.';
  }
};
```

## Token Management

### Store Tokens Securely
```javascript
const storeTokens = (tokens) => {
  // Store access token in memory or secure storage
  sessionStorage.setItem('accessToken', tokens.accessToken);
  
  // Store refresh token in secure HTTP-only cookie (if possible)
  // Or use secure storage
  localStorage.setItem('refreshToken', tokens.refreshToken);
};
```

### Add Authorization Header
```javascript
const apiCall = async (url, options = {}) => {
  const token = sessionStorage.getItem('accessToken');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };
  
  return fetch(url, config);
};
```

### Token Refresh
```javascript
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    const data = await response.json();
    
    if (data.success) {
      sessionStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    } else {
      // Redirect to login
      logout();
    }
  } catch (error) {
    logout();
  }
};
```

## User Data Structure

### User Object from API
```javascript
const userData = {
  id: 1,
  email: "user@university.edu",
  name: "John Doe",
  username: "johndoe",
  universityId: 1,
  degree: "Computer Science",
  year: "3rd Year",
  gender: "Male",
  dateOfBirth: "1995-01-01T00:00:00.000Z",
  skills: ["JavaScript", "React", "Node.js"],
  friends: ["friend1@university.edu", "friend2@university.edu"],
  aboutMe: "I love coding and meeting new people",
  sports: "Basketball, Football",
  movies: "Inception, The Dark Knight",
  tvShows: "Breaking Bad, Game of Thrones",
  teams: "Lakers, Manchester United",
  portfolioLink: "https://portfolio.com",
  phoneNumber: "+1234567890",
  isProfileComplete: true,
  isEmailVerified: true
};
```

## Navigation Flow

### Login Flow
1. **Connect Students Screen** → "Already a user? Login" (clickable)
2. **Login Email Screen** → Enter university email
3. **API Call** → Check user existence
4. **API Call** → Send OTP
5. **OTP Screen** → Enter OTP
6. **API Call** → Verify OTP
7. **Explore Page** → User logged in with all data intact

### Error Handling Flow
1. **Invalid Email** → Show error, stay on email screen
2. **User Not Found** → Show error, suggest signup
3. **Invalid OTP** → Show error, allow retry
4. **Network Error** → Show error, allow retry

## Testing Checklist

### Frontend Testing
- [ ] Email validation works correctly
- [ ] Error messages display properly
- [ ] Loading states work during API calls
- [ ] Navigation flow works correctly
- [ ] Token storage works properly
- [ ] User data is preserved after login
- [ ] Logout functionality works
- [ ] Token refresh works

### Integration Testing
- [ ] Complete login flow works end-to-end
- [ ] Error scenarios are handled properly
- [ ] Network errors are handled gracefully
- [ ] User data is correctly displayed after login
- [ ] Authentication state is maintained

## Security Considerations

### Frontend Security
- Don't store sensitive data in localStorage
- Use secure storage for tokens when possible
- Implement proper logout functionality
- Clear all data on logout
- Validate input on frontend before sending to API

### API Security
- All endpoints are rate-limited
- Email validation is enforced
- OTP expiration is handled
- JWT tokens are properly secured
- Input sanitization is implemented

## Environment Setup

### Development
```javascript
const API_BASE_URL = 'http://localhost:3000/api/v1';
```

### Production
```javascript
const API_BASE_URL = 'https://your-api-domain.com/api/v1';
```

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify API endpoints are accessible
3. Check network tab for failed requests
4. Ensure environment variables are set correctly
5. Contact the backend team for API issues 