# Notification System Implementation

## Overview
The notification system has been successfully implemented to handle two types of notifications:
1. **Connection Requests** - When users send connection requests to each other
2. **Adjective Notifications** - When users receive adjective selections from others

## Database Schema

### Connection Requests Table
```sql
CREATE TABLE connection_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL REFERENCES users(id),
  target_id INTEGER NOT NULL REFERENCES users(id),
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_connection_request (requester_id, target_id)
);
```

### Notification Read Status Table
```sql
CREATE TABLE notification_read_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  notification_id INTEGER NOT NULL,
  notification_type ENUM('connection_request', 'adjective_notification') NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_notification_read (user_id, notification_id, notification_type)
);
```

## API Endpoints

### 1. Get All Notifications
**Endpoint:** `GET /api/v1/notifications`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "connectionRequests": [
    {
      "id": 1,
      "requesterId": 2,
      "requesterName": "John Doe",
      "requesterLocation": "IIT Delhi",
      "requesterProfileImage": "https://example.com/image.jpg",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "adjectiveNotifications": [
    {
      "id": 1,
      "adjective": "funny",
      "count": 5,
      "userIds": [2, 3, 4, 5, 6],
      "userNames": ["User1", "User2", "User3", "User4", "User5"],
      "userProfileImages": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
      "timeAgo": "2 hours ago",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "requestCount": 3
}
```

### 2. Handle Connection Request (Accept/Reject)
**Endpoint:** `POST /api/v1/notifications/connection-request`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "requestId": 1,
  "action": "accept" | "reject"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request accepted successfully",
  "connectionState": {
    "id": 1,
    "userId1": 2,
    "userId2": 1,
    "status": "connected",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Mark Notification as Read
**Endpoint:** `POST /api/v1/notifications/{notificationId}/read`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "notificationType": "connection_request" | "adjective_notification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

## Implementation Details

### Models Created
1. **ConnectionRequest** (`src/models/connectionRequest.model.ts`)
   - Handles connection requests between users
   - Tracks request status (pending, accepted, rejected)

2. **NotificationReadStatus** (`src/models/notificationReadStatus.model.ts`)
   - Tracks read status of notifications
   - Supports both connection requests and adjective notifications

### Controllers
**NotificationController** (`src/controllers/notification.controller.ts`)
- `getNotifications()` - Fetch all notifications for a user
- `handleConnectionRequest()` - Accept/reject connection requests
- `markNotificationAsRead()` - Mark notifications as read

### Routes
**NotificationRoutes** (`src/routes/notification.routes.ts`)
- `GET /api/v1/notifications` - Get all notifications
- `POST /api/v1/notifications/connection-request` - Handle accept/reject
- `POST /api/v1/notifications/:id/read` - Mark as read

### Database Migrations
1. **20250102000000-create-connection-requests.js** - Creates connection_requests table
2. **20250102000001-create-notification-read-status.js** - Creates notification_read_status table

## Integration Points

### Connection Management
- Updated `explore.controller.ts` to use `ConnectionRequest` model
- When users send connection requests, they're stored in `connection_requests` table
- When requests are accepted, connections are created in `connections` table

### Adjective Notifications
- Uses existing `AdjectiveMatch` table for adjective selections
- Groups adjective selections by adjective for notification display
- Shows count of users who selected each adjective

## Frontend Integration

The notification system is designed to work with the frontend changes you've already implemented:

### Expected Frontend API Calls
1. **Fetch Notifications:**
   ```javascript
   const response = await fetch('/api/v1/notifications', {
     headers: { 'Authorization': `Bearer ${token}` }
   });
   ```

2. **Handle Connection Request:**
   ```javascript
   const response = await fetch('/api/v1/notifications/connection-request', {
     method: 'POST',
     headers: { 
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({ requestId: 1, action: 'accept' })
   });
   ```

3. **Mark as Read:**
   ```javascript
   const response = await fetch(`/api/v1/notifications/${notificationId}/read`, {
     method: 'POST',
     headers: { 
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({ notificationType: 'connection_request' })
   });
   ```

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Unauthorized",
  "errorCode": "UNAUTHORIZED"
}
```

```json
{
  "success": false,
  "message": "Request not found",
  "errorCode": "REQUEST_NOT_FOUND"
}
```

```json
{
  "success": false,
  "message": "Invalid action",
  "errorCode": "INVALID_ACTION"
}
```

## Security Features

1. **Authentication Required** - All endpoints require valid JWT token
2. **Authorization** - Users can only view their own notifications
3. **Input Validation** - All request parameters are validated
4. **SQL Injection Protection** - Using Sequelize ORM with parameterized queries

## Performance Optimizations

1. **Database Indexes** - Added indexes on frequently queried columns
2. **Efficient Queries** - Using proper joins and aggregations
3. **Caching Ready** - Structure supports future caching implementation

## Testing

To test the notification system:

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test endpoints:**
   ```bash
   npx ts-node src/scripts/testNotifications.ts
   ```

## Next Steps

1. **Frontend Integration** - Connect the frontend notification components to these APIs
2. **Real-time Updates** - Consider implementing WebSocket for real-time notifications
3. **Push Notifications** - Add push notification support for immediate alerts
4. **Notification Preferences** - Allow users to configure notification settings
5. **Analytics** - Track notification engagement metrics

## Files Modified/Created

### New Files
- `src/models/connectionRequest.model.ts`
- `src/models/notificationReadStatus.model.ts`
- `src/controllers/notification.controller.ts`
- `src/routes/notification.routes.ts`
- `migrations/20250102000000-create-connection-requests.js`
- `migrations/20250102000001-create-notification-read-status.js`
- `src/scripts/checkTables.ts`
- `src/scripts/testNotifications.ts`

### Modified Files
- `src/models/associations.ts` - Added new model associations
- `src/app.ts` - Added notification routes
- `src/controllers/explore.controller.ts` - Updated to use ConnectionRequest model

The notification system is now fully implemented and ready for frontend integration!