# Enhanced Adjective Matching System

## Overview
This document describes the enhanced adjective matching system with gender-based adjective selection, user engagement tracking, and mutual matching functionality.

## 🚀 Features Implemented

### ✅ Core Features
- **Gender-based Adjective Filtering**: Different adjectives shown based on gender combinations
- **User Engagement Tracking**: Smart adjective display (1 selected + 3 random if previous selection exists)
- **Enhanced Match System**: Mutual adjective matching with connection flow
- **Ice-breaking Prompts**: Contextual prompts based on mutual adjectives
- **Pre-connection Chat Restrictions**: Chat disabled until users connect after matching

### ✅ Database Schema
Three new tables have been created:

1. **adjective_selections** - Tracks individual adjective selections with user engagement
2. **matches** - Stores enhanced match data with connection status and ice-breaking prompts
3. **Enhanced chat system** - Works with new Match model

### ✅ API Endpoints
All required endpoints have been implemented:

#### Enhanced Explore System
1. **GET /api/v1/enhanced-explore/profile/gender** - Get user's gender
2. **GET /api/v1/enhanced-explore/adjectives/selections/:targetUserId** - Get adjective selections
3. **GET /api/v1/enhanced-explore/adjectives/available/:targetUserId** - Get available adjectives
4. **POST /api/v1/enhanced-explore/adjectives/select** - Select adjective with gender validation
5. **GET /api/v1/enhanced-explore/matches/state/:targetUserId** - Get match state
6. **POST /api/v1/enhanced-explore/matches/connect** - Connect after match
7. **GET /api/v1/enhanced-explore/matches/ice-breaking/:targetUserId** - Get ice-breaking prompt

#### Enhanced Chat System
1. **GET /api/v1/enhanced-chats/active** - Get active conversations (connected users)
2. **GET /api/v1/enhanced-chats/matches** - Get matched conversations (matched users)
3. **GET /api/v1/enhanced-chats/{conversationId}/messages** - Get conversation messages
4. **POST /api/v1/enhanced-chats/{conversationId}/messages** - Send message with connection validation
5. **POST /api/v1/enhanced-chats/{conversationId}/read** - Mark messages as read
6. **GET /api/v1/enhanced-chats/conversation/{userId}** - Get or create conversation by user ID
7. **GET /api/v1/enhanced-chats/{conversationId}/details** - Get conversation details with match state

## 📁 Files Created/Modified

### New Models
- `src/models/adjectiveSelection.model.ts` - Adjective selection model
- `src/models/match.model.ts` - Enhanced match model
- `src/models/associations.ts` - Updated with new associations

### New Controllers
- `src/controllers/enhancedExplore.controller.ts` - Enhanced explore controller
- `src/controllers/enhancedChat.controller.ts` - Enhanced chat controller

### New Routes
- `src/routes/enhancedExplore.routes.ts` - Enhanced explore routes
- `src/routes/enhancedChat.routes.ts` - Enhanced chat routes

### New Migrations
- `migrations/20250106000000-create-adjective-selections.js` - Adjective selections table
- `migrations/20250106000001-create-matches.js` - Matches table

## 🔧 Business Logic

### Gender-based Adjective Filtering
```typescript
// Same gender: show gender-specific + neutral adjectives
// Different gender: show only neutral adjectives
const getAdjectivesForGender = (viewerGender: string, targetGender: string): string[] => {
  if (viewerGender === targetGender) {
    const genderSpecific = viewerGender === 'Male' ? MALE_ADJECTIVES : FEMALE_ADJECTIVES;
    return [...genderSpecific, ...GENDER_NEUTRAL_ADJECTIVES];
  } else {
    return GENDER_NEUTRAL_ADJECTIVES;
  }
};
```

### User Engagement Tracking
```typescript
// If user has previous selection: show 1 selected + 3 random adjectives
// If no previous selection: show 4 random adjectives
if (existingSelection) {
  const selectedAdjective = existingSelection.adjective;
  const remainingAdjectives = allowedAdjectives.filter(adj => adj !== selectedAdjective);
  const shuffled = remainingAdjectives.sort(() => 0.5 - Math.random());
  const randomAdjectives = shuffled.slice(0, 3);
  adjectives = [selectedAdjective, ...randomAdjectives];
} else {
  const shuffled = allowedAdjectives.sort(() => 0.5 - Math.random());
  adjectives = shuffled.slice(0, 4);
}
```

### Match Detection
```typescript
// Check for mutual match when user selects adjective
const mutualSelection = await AdjectiveSelection.findOne({
  where: {
    userId: parseInt(targetUserId),
    targetUserId: currentUserId,
    adjective
  }
});

if (mutualSelection) {
  // Create match with ice-breaking prompt
  const match = await Match.create({
    userId1: Math.min(currentUserId, parseInt(targetUserId)),
    userId2: Math.max(currentUserId, parseInt(targetUserId)),
    mutualAdjective: adjective,
    isConnected: false,
    matchTimestamp: new Date(),
    iceBreakingPrompt: generateIceBreakingPrompt(adjective)
  });
}
```

### Connection Flow
```typescript
// Users must connect after matching before they can chat
if (match && !match.isConnected) {
  res.status(403).json({ 
    success: false, 
    message: 'You need to connect first before sending messages',
    requiresConnection: true
  });
  return;
}
```

## 🎯 Adjective Pools

### Male-Specific Adjectives (25)
- Handsome, Strong, Brave, Confident, Loyal, Reliable, Honest, Hardworking, Protective, Respectful, Determined, Disciplined, Steadfast, Courageous, Thoughtful, Dutiful, Gallant, Steady, Vigilant, Tough, Sincere, Decisive, Witty, Daring, Honorable

### Female-Specific Adjectives (25)
- Beautiful, Graceful, Kind, Caring, Elegant, Nurturing, Gentle, Compassionate, Radiant, Warm, Empathetic, Intuitive, Joyful, Poised, Articulate, Persistent, Loving, Cheerful, Vibrant, Serene, Lovable, Bright, Charming, Gracious, Selfless

### Gender-Neutral Adjectives (25)
- Smart, Funny, Friendly, Creative, Optimistic, Organized, Adaptable, Generous, Passionate, Enthusiastic, Curious, Mindful, Innovative, Dedicated, Resourceful, Practical, Genuine, Considerate, Collaborative, Resilient, Open-minded, Level-headed, Ambitious, Analytical, Patient

## 🧊 Ice-Breaking Prompts

Each adjective has a contextual ice-breaking prompt:
```typescript
const ICE_BREAKING_PROMPTS = {
  'Smart': "You both find each other smart! 🧠 What's the most interesting thing you've learned recently?",
  'Funny': "You both find each other funny! 😄 What's your favorite joke or funny story?",
  'Creative': "You both find each other creative! 🎨 What's your favorite way to express creativity?",
  // ... more prompts for each adjective
};
```

## 🔄 User Flow

### 1. Profile Viewing
- User views a profile
- System determines gender combination
- Shows appropriate adjectives (gender-specific + neutral OR neutral only)

### 2. Adjective Selection
- User selects an adjective
- System validates against allowed adjectives for gender combination
- Stores selection in `adjective_selections` table

### 3. Match Detection
- System checks if target user has selected same adjective
- If match found, creates entry in `matches` table
- Generates ice-breaking prompt

### 4. Match State
- Users see each other in "Matches" tab
- Chat is disabled until connection
- Shows ice-breaking prompt and connect button

### 5. Connection
- User clicks "Connect" button
- Updates match status to connected
- Enables chat functionality

## 🛡️ Security & Validation

### Input Validation
- Validate adjective selection against allowed adjectives for gender combination
- Ensure user can only select adjectives for profiles they can see
- Prevent duplicate selections

### Rate Limiting
- Limit adjective selections per user per time period
- Prevent spam selections

### Data Privacy
- Ensure match data is only visible to matched users
- Protect user gender information

## 📊 Performance Considerations

### Database Indexing
- Index on `adjective_selections(userId, targetUserId)`
- Index on `matches(userId1, userId2)`
- Index on `users(gender)` for filtering

### Caching
- Cache user gender information
- Cache adjective selections for quick lookup
- Cache match states

### Query Optimization
- Use efficient joins for match detection
- Implement pagination for large datasets

## 🧪 Testing Requirements

### Unit Tests
- Adjective selection logic
- Match detection algorithm
- Gender-based filtering

### Integration Tests
- End-to-end match flow
- Connection process
- Real-time notifications

### Performance Tests
- Large dataset handling
- Concurrent user scenarios

## 🚀 Migration Strategy

### Phase 1: Database Updates
- Run new migrations
- Add new tables and columns
- Migrate existing data if needed

### Phase 2: API Implementation
- Deploy new endpoints
- Test with existing frontend

### Phase 3: Frontend Integration
- Update frontend to use new APIs
- Implement enhanced UI features

### Phase 4: Full Rollout
- Enable new system for all users
- Monitor performance and user feedback

## 📝 API Examples

### Get Available Adjectives
```bash
GET /api/v1/enhanced-explore/adjectives/available/123
```
Response:
```json
{
  "success": true,
  "adjectives": ["Smart", "Funny", "Creative", "Kind"],
  "hasPreviousSelection": false,
  "previousSelection": null
}
```

### Select Adjective
```bash
POST /api/v1/enhanced-explore/adjectives/select
{
  "targetUserId": "123",
  "adjective": "Smart"
}
```
Response:
```json
{
  "success": true,
  "matched": true,
  "matchData": {
    "id": "uuid",
    "userId1": 1,
    "userId2": 123,
    "mutualAdjective": "Smart",
    "matchTimestamp": "2024-01-06T10:00:00Z"
  }
}
```

### Get Match State
```bash
GET /api/v1/enhanced-explore/matches/state/123
```
Response:
```json
{
  "success": true,
  "matchState": {
    "id": "uuid",
    "userId1": 1,
    "userId2": 123,
    "mutualAdjective": "Smart",
    "isConnected": false,
    "matchTimestamp": "2024-01-06T10:00:00Z",
    "connectionTimestamp": null,
    "iceBreakingPrompt": "You both find each other smart! 🧠 What's the most interesting thing you've learned recently?"
  }
}
```

## ✅ Status

- [x] Database schema implemented
- [x] Models and associations created
- [x] Enhanced explore controller implemented
- [x] Enhanced chat controller implemented
- [x] API routes configured
- [x] Gender-based adjective filtering
- [x] User engagement tracking
- [x] Match detection and creation
- [x] Ice-breaking prompts
- [x] Connection flow
- [x] Pre-connection chat restrictions
- [x] Documentation completed

The enhanced adjective matching system is now ready for deployment and frontend integration! 