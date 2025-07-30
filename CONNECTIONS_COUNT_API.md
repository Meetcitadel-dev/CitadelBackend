# Connections Count API

## Overview
This API endpoint provides the count of active connections for the authenticated user. It counts all connections where the status is 'connected' and the user is either the initiator (userId1) or the recipient (userId2).

## Endpoint
```
GET /api/v1/connections/count
```

## Authentication
- **Required**: JWT Bearer token in Authorization header
- **Header**: `Authorization: Bearer <token>`

## Request
No request body required.

## Response

### Success Response (200)
```json
{
  "success": true,
  "connectionsCount": 12,
  "message": "Connections count retrieved successfully"
}
```

### Error Responses

#### Unauthorized (401)
```json
{
  "success": false,
  "message": "Access token is missing or invalid"
}
```

#### Internal Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Database Query
The endpoint performs the following database query:
```sql
SELECT COUNT(*) FROM connections 
WHERE status = 'connected' 
AND (userId1 = :currentUserId OR userId2 = :currentUserId)
```

## Implementation Details

### Backend Changes Made:
1. **Controller**: Added `getConnectionsCount` function to `explore.controller.ts`
2. **Routes**: Added new route `/count` to `connections.routes.ts`
3. **Authentication**: Uses existing `authenticateToken` middleware
4. **Database**: Uses Sequelize `Connection.count()` with `Op.or` condition

### Frontend Integration:
The frontend should call this endpoint to get the actual connections count instead of using the onboarding friends count.

### Example Usage:
```javascript
// Frontend API call
const response = await fetch('/api/v1/connections/count', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
if (data.success) {
  console.log(`User has ${data.connectionsCount} connections`);
}
```

## Notes
- Only counts connections with status 'connected'
- Includes both incoming and outgoing connections
- Real-time count that updates as users make new connections
- Replaces the previous "friends count" from onboarding data 