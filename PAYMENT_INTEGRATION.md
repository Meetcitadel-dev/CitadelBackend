# Razorpay Payment Integration with MongoDB

This document outlines the complete backend implementation for the Razorpay payment gateway integration with MongoDB for event bookings.

## Environment Variables Required

Add the following to your `.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/citadel_events
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/citadel_events

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_test_key_id_here
RAZORPAY_KEY_SECRET=your_test_key_secret_here

# Note: In production, use live keys instead of test keys
# RAZORPAY_KEY_ID=rzp_live_your_live_key_id_here
# RAZORPAY_KEY_SECRET=your_live_key_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Database Schema (MongoDB)

### Events Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  eventType: String, // 'Dinner', 'Lunch', 'Breakfast', 'Party', 'Meeting', 'Other'
  date: Date,
  time: String,
  location: String,
  price: Number,
  currency: String, // Default: 'INR'
  maxGuests: Number,
  currentBookings: Number, // Default: 0
  status: String, // 'active', 'inactive', 'cancelled'
  imageUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Bookings Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  eventId: String,
  eventType: String,
  amount: Number,
  currency: String, // Default: 'INR'
  status: String, // 'pending', 'confirmed', 'cancelled', 'failed'
  razorpayOrderId: String,
  razorpayPaymentId: String,
  bookingDate: Date,
  bookingTime: String,
  location: String,
  guests: Number, // Default: 1
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Payments Collection
```javascript
{
  _id: ObjectId,
  bookingId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  amount: Number,
  currency: String, // Default: 'INR'
  status: String, // 'pending', 'completed', 'failed'
  signature: String,
  paymentMethod: String,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### 1. Create Order
**Endpoint:** `POST /api/v1/payments/create-order`

**Request Body:**
```json
{
  "userId": "user_123",
  "eventId": "event_456",
  "eventType": "Dinner",
  "amount": 7500,
  "currency": "INR",
  "bookingDate": "2024-01-15",
  "bookingTime": "19:00",
  "location": "Restaurant Name, City",
  "guests": 2,
  "notes": "Special dietary requirements"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "order_1234567890",
      "amount": 750000,
      "currency": "INR",
      "receipt": "booking_507f1f77bcf86cd799439011",
      "status": "created"
    },
    "booking": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "user_123",
      "eventId": "event_456",
      "status": "pending",
      "razorpayOrderId": "order_1234567890"
    },
    "payment": {
      "_id": "507f1f77bcf86cd799439012",
      "bookingId": "507f1f77bcf86cd799439011",
      "razorpayOrderId": "order_1234567890",
      "status": "pending"
    }
  }
}
```

### 2. Verify Payment
**Endpoint:** `POST /api/v1/payments/verify`

**Request Body:**
```json
{
  "order_id": "order_1234567890",
  "payment_id": "pay_1234567890",
  "signature": "generated_signature_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "bookingId": "507f1f77bcf86cd799439011",
    "paymentId": "507f1f77bcf86cd799439012"
  }
}
```

### 3. Get Booking Details
**Endpoint:** `GET /api/v1/payments/booking/:bookingId`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Booking retrieved successfully",
  "data": {
    "booking": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "user_123",
      "eventId": "event_456",
      "status": "confirmed",
      "amount": 7500
    },
    "payment": {
      "_id": "507f1f77bcf86cd799439012",
      "status": "completed",
      "razorpayPaymentId": "pay_1234567890"
    },
    "event": {
      "_id": "event_456",
      "title": "Dinner Event",
      "eventType": "Dinner"
    }
  }
}
```

### 4. Get User Bookings
**Endpoint:** `GET /api/v1/payments/user/:userId/bookings`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User bookings retrieved successfully",
  "data": [
    {
      "booking": {
        "_id": "507f1f77bcf86cd799439011",
        "userId": "user_123",
        "status": "confirmed"
      },
      "payment": {
        "_id": "507f1f77bcf86cd799439012",
        "status": "completed"
      },
      "event": {
        "_id": "event_456",
        "title": "Dinner Event"
      }
    }
  ]
}
```

### 5. Get Events
**Endpoint:** `GET /api/v1/payments/events?eventType=Dinner&status=active`

**Response:**
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": [
    {
      "_id": "event_456",
      "title": "Dinner Event",
      "description": "A wonderful dinner experience",
      "eventType": "Dinner",
      "price": 7500,
      "maxGuests": 50,
      "currentBookings": 25,
      "status": "active"
    }
  ]
}
```

### 6. Create Event
**Endpoint:** `POST /api/v1/payments/events`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "Dinner Event",
  "description": "A wonderful dinner experience",
  "eventType": "Dinner",
  "date": "2024-01-15",
  "time": "19:00",
  "location": "Restaurant Name, City",
  "price": 7500,
  "currency": "INR",
  "maxGuests": 50,
  "imageUrl": "https://example.com/image.jpg"
}
```

## Frontend Integration

### 1. Environment Variables for Frontend
Create a `.env` file in your frontend root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_test_key_id_here

# Note: In production, use live keys
# VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key_id_here
```

### 2. Payment Service (Frontend)
```typescript
// src/lib/payment.ts
class PaymentService {
  private static instance: PaymentService;
  private razorpay: any;

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }

  async createOrder(bookingData: any): Promise<any> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    return response.json();
  }

  async verifyPayment(paymentData: any): Promise<any> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    return response.json();
  }

  async processPayment(orderData: any, userData: any): Promise<any> {
    await this.loadRazorpayScript();

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: 'Citadel Events',
      description: 'Event Booking',
      order_id: orderData.order.id,
      handler: async (response: any) => {
        try {
          const verification = await this.verifyPayment({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          return verification;
        } catch (error) {
          throw error;
        }
      },
      prefill: {
        name: userData.name,
        email: userData.email,
        contact: userData.phone,
      },
      theme: {
        color: '#3399cc',
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  }
}

export default PaymentService.getInstance();
```

## Security Features

1. **Signature Verification:** All payments are verified using Razorpay's signature verification
2. **Environment Variables:** API keys are stored securely in environment variables
3. **Input Validation:** All input data is validated on the backend
4. **Error Handling:** Comprehensive error handling and logging
5. **HTTPS:** Use HTTPS in production for secure communication

## Testing

### Test Cards (Razorpay Test Mode)
- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002
- **CVV:** Any 3 digits
- **Expiry:** Any future date

### Test Flow
1. Create an event using the create event endpoint
2. Create a booking order using the create order endpoint
3. Process payment using Razorpay test cards
4. Verify payment using the verify endpoint
5. Check booking status using the get booking endpoint

## Production Deployment

1. **Environment Variables:**
   - Replace test keys with live Razorpay keys
   - Update MongoDB connection string for production
   - Set NODE_ENV=production

2. **Security:**
   - Enable HTTPS
   - Set up proper CORS configuration
   - Implement rate limiting
   - Set up monitoring and logging

3. **Database:**
   - Use MongoDB Atlas or production MongoDB instance
   - Set up database backups
   - Configure proper indexes for performance

4. **Monitoring:**
   - Set up payment webhooks for real-time updates
   - Implement retry mechanisms for failed payments
   - Set up error tracking and monitoring

## Error Handling

The system handles various error scenarios:
- Invalid payment signatures
- Insufficient event capacity
- Network failures
- Invalid booking data
- Database connection issues

All errors are logged and appropriate HTTP status codes are returned to the client. 