# Frontend Integration Guide - Session-Based Adjective System

## 🎯 Overview
This guide shows you exactly how to update your frontend to work with the new session-based adjective system.

## 📋 What Changed in the Backend

### API Response Now Includes `sessionId`
```json
{
  "success": true,
  "adjectives": ["Smart", "Funny", "Creative", "Optimistic"],
  "sessionId": "session_1704067200000_abc123def", // ← NEW FIELD
  "hasTargetUserSelection": false,
  "targetUserSelection": null,
  "hasCurrentUserSelection": false,
  "currentUserSelection": null
}
```

### API Endpoint Now Accepts `sessionId` Query Parameter
```
GET /api/v1/enhanced-explore/adjectives/available/:targetUserId?sessionId=session_123
```

## 🔧 Frontend Changes Required

### 1. Update TypeScript Interface

Add `sessionId` to your `AdjectiveResponse` interface:

```typescript
interface AdjectiveResponse {
  success: boolean;
  adjectives: string[];
  sessionId: string; // ← ADD THIS LINE
  hasTargetUserSelection: boolean;
  targetUserSelection: string | null;
  hasCurrentUserSelection: boolean;
  currentUserSelection: string | null;
}
```

### 2. Update API Function

Modify your `getAvailableAdjectives` function to accept and pass `sessionId`:

```typescript
// Before
export function getAvailableAdjectives(targetUserId: string, token?: string) {
  return apiClient<AdjectiveResponse>(`/api/v1/enhanced-explore/adjectives/available/${targetUserId}`, { 
    method: 'GET', 
    token 
  });
}

// After
export function getAvailableAdjectives(targetUserId: string, token?: string, sessionId?: string) {
  const url = `/api/v1/enhanced-explore/adjectives/available/${targetUserId}${sessionId ? `?sessionId=${sessionId}` : ''}`;
  return apiClient<AdjectiveResponse>(url, { method: 'GET', token });
}
```

### 3. Update Component State Management

Add session state to your component:

```typescript
// Add session state
const [sessionId, setSessionId] = useState<string | null>(null);

// Update your query to include sessionId
const { data: adjectivesData } = useQuery({
  queryKey: ['adjectives', currentProfile.id, sessionId],
  queryFn: () => getAvailableAdjectives(String(currentProfile.id), token, sessionId),
  staleTime: Infinity, // Never refetch for same session
});

// Update session ID when new one is provided
useEffect(() => {
  if (adjectivesData?.sessionId) {
    setSessionId(adjectivesData.sessionId);
  }
}, [adjectivesData?.sessionId]);
```

### 4. Complete Component Example

Here's a complete example of how your component should look:

```typescript
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface AdjectiveResponse {
  success: boolean;
  adjectives: string[];
  sessionId: string;
  hasTargetUserSelection: boolean;
  targetUserSelection: string | null;
  hasCurrentUserSelection: boolean;
  currentUserSelection: string | null;
}

export function getAvailableAdjectives(targetUserId: string, token?: string, sessionId?: string) {
  const url = `/api/v1/enhanced-explore/adjectives/available/${targetUserId}${sessionId ? `?sessionId=${sessionId}` : ''}`;
  return apiClient<AdjectiveResponse>(url, { method: 'GET', token });
}

export function ProfileComponent({ currentProfile, token }: { currentProfile: any, token: string }) {
  // Session state management
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Fetch adjectives with session support
  const { data: adjectivesData, isLoading, error } = useQuery({
    queryKey: ['adjectives', currentProfile.id, sessionId],
    queryFn: () => getAvailableAdjectives(String(currentProfile.id), token, sessionId),
    staleTime: Infinity, // Never refetch for same session
    enabled: !!currentProfile.id && !!token,
  });

  // Update session ID when new one is provided
  useEffect(() => {
    if (adjectivesData?.sessionId) {
      setSessionId(adjectivesData.sessionId);
    }
  }, [adjectivesData?.sessionId]);

  // Handle adjective selection
  const handleAdjectiveSelect = async (adjective: string) => {
    try {
      const response = await apiClient('/api/v1/enhanced-explore/adjectives/select', {
        method: 'POST',
        token,
        body: {
          targetUserId: currentProfile.id,
          adjective
        }
      });
      
      if (response.success) {
        // Refresh the query to get updated data
        // Note: The sessionId will remain the same, so adjectives stay consistent
        queryClient.invalidateQueries(['adjectives', currentProfile.id, sessionId]);
      }
    } catch (error) {
      console.error('Error selecting adjective:', error);
    }
  };

  if (isLoading) return <div>Loading adjectives...</div>;
  if (error) return <div>Error loading adjectives</div>;
  if (!adjectivesData) return <div>No adjectives available</div>;

  return (
    <div>
      <h2>Profile: {currentProfile.name}</h2>
      <p>Session ID: {sessionId}</p>
      <div>
        {adjectivesData.adjectives.map((adjective, index) => (
          <button
            key={index}
            onClick={() => handleAdjectiveSelect(adjective)}
            className="adjective-button"
          >
            {adjective}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## 🎯 Key Benefits After Implementation

### ✅ **Consistent Adjectives Within Session**
- User sees Profile A → gets [Smart, Funny, Creative, Optimistic]
- User clicks "i" → navigates to user profile
- User clicks back → sees same [Smart, Funny, Creative, Optimistic]

### ✅ **Fresh Adjectives for New Login**
- User logs out → logs in again
- User sees Profile A → gets [Brave, Kind, Loyal, Wise] (different adjectives)

### ✅ **Automatic Session Management**
- Sessions expire after 24 hours
- No manual cleanup required
- Backend handles all session logic

## 🧪 Testing Your Implementation

### Test Scenario 1: Same Session Consistency
1. Load a profile → Note the adjectives and sessionId
2. Navigate away from the profile
3. Navigate back to the same profile
4. ✅ Verify: Same adjectives, same sessionId

### Test Scenario 2: New Session Freshness
1. Clear your session storage or log out/in
2. Load the same profile
3. ✅ Verify: Different adjectives, different sessionId

### Test Scenario 3: Adjective Selection
1. Select an adjective
2. Navigate away and back
3. ✅ Verify: Selected adjective is still selected, other adjectives remain the same

## 🚨 Important Notes

### Session Storage
- **Don't store sessionId in localStorage** - it should be component state
- **SessionId is per user-pair** - different profiles will have different sessionIds
- **Sessions expire automatically** - no manual cleanup needed

### Query Key
- **Include sessionId in query key** - this ensures proper caching
- **Use staleTime: Infinity** - prevents unnecessary refetches within same session

### Error Handling
- **Handle missing sessionId gracefully** - API will generate new session
- **Invalid sessionIds are handled automatically** - backend creates new session

## 🔄 Migration Strategy

### Phase 1: Backend Ready ✅
- Database table created
- API endpoints updated
- Session management implemented

### Phase 2: Frontend Updates (Your Task)
1. Update TypeScript interfaces
2. Modify API functions
3. Add session state management
4. Test with existing users

### Phase 3: Deployment
1. Deploy backend changes
2. Deploy frontend changes
3. Monitor for any issues
4. Celebrate! 🎉

## 📞 Need Help?

If you encounter any issues:

1. **Check the browser network tab** - verify sessionId is being sent/received
2. **Check the backend logs** - look for session creation/retrieval
3. **Test with the provided test script** - verify backend functionality
4. **Check the database** - verify sessions are being stored correctly

The session-based system is now ready and will provide the exact user experience you wanted! 🚀