# Citadel Backend

A comprehensive Node.js/TypeScript backend for a university student networking and dating platform. Built with Express.js, PostgreSQL, Redis, and WebSocket support for real-time communication.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**: JWT-based authentication with OTP verification
- **Profile Management**: Complete user profiles with university verification
- **Smart Matching System**: Advanced algorithm-based user matching with adjective selection
- **Real-time Chat**: WebSocket-powered instant messaging
- **Connection Management**: Friend requests, blocking, and mutual connections
- **Payment Integration**: Razorpay and PhonePe payment gateways
- **File Upload**: AWS S3 integration for image storage
- **Notification System**: Real-time notifications and status updates

### Advanced Features
- **Enhanced Explore**: Grid view with advanced filtering and search
- **Adjective Matching**: Unique personality-based matching system
- **University Integration**: Domain-based email verification
- **Online Status Tracking**: Real-time user online/offline status
- **Message Status**: Read receipts and typing indicators
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Cross-origin resource sharing setup

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Cache**: Upstash Redis (primary) with traditional Redis fallback
- **Real-time**: Socket.io for WebSocket connections
- **Authentication**: JWT tokens with bcrypt
- **File Storage**: AWS S3 with CloudFront CDN
- **Payment**: Razorpay and PhonePe integration
- **Email**: Nodemailer with SendGrid
- **Security**: Helmet.js, CORS, Rate limiting

### Development Tools
- **TypeScript**: Static type checking
- **Docker**: Containerized development environment
- **Database Migrations**: Sequelize migrations
- **Environment Management**: dotenv configuration

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── explore.controller.ts
│   │   ├── payment.controller.ts
│   │   └── ...
│   ├── models/              # Database models
│   │   ├── user.model.ts
│   │   ├── connection.model.ts
│   │   ├── conversation.model.ts
│   │   └── ...
│   ├── routes/              # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── explore.routes.ts
│   │   └── ...
│   ├── services/            # Business logic services
│   │   ├── websocket.service.ts
│   │   ├── payment.service.ts
│   │   ├── email.service.ts
│   │   └── ...
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── upload.middleware.ts
│   ├── config/              # Configuration files
│   │   ├── db.ts
│   │   ├── aws.ts
│   │   └── redis.ts
│   ├── utils/               # Utility functions
│   ├── scripts/             # Development scripts
│   ├── migrations/          # Database migrations
│   ├── seeders/             # Database seeders
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
├── docker-compose.yml      # Docker services
├── package.json           # Dependencies
└── tsconfig.json         # TypeScript config
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Docker and Docker Compose
- PostgreSQL
- Redis

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Citadelbackend/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   # Database
   POSTGRES_DB=citadel
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=Passwordcitadel
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432

   # JWT
   JWT_SECRET=your_jwt_secret_here

   # AWS
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   S3_BUCKET_NAME=your_s3_bucket
   CLOUDFRONT_URL=your_cloudfront_url

   # Payment
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   PHONEPE_MERCHANT_ID=your_phonepe_merchant_id
   PHONEPE_SALT_KEY=your_phonepe_salt_key
   PHONEPE_SALT_INDEX=1

   # Email
   SENDGRID_API_KEY=your_sendgrid_api_key
   EMAIL_FROM=your_email@domain.com

   # Server
   PORT=3001
   BASE_URL=http://localhost:3001
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start services with Docker**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   npm run build
   npx sequelize-cli db:migrate
   ```

6. **Seed initial data**
   ```bash
   npx sequelize-cli db:seed:all
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

## 📚 API Documentation

### Authentication Endpoints

#### `POST /api/v1/auth/check-user`
Check if user exists and can proceed with login
```json
{
  "email": "user@university.edu"
}
```

#### `POST /api/v1/auth/send-otp`
Send OTP to user's email
```json
{
  "email": "user@university.edu",
  "isLogin": false
}
```

#### `POST /api/v1/auth/verify-otp`
Verify OTP and authenticate user
```json
{
  "email": "user@university.edu",
  "otp": "123456"
}
```

### Profile Management

#### `GET /api/v1/profile`
Get user profile information

#### `PUT /api/v1/profile`
Update user profile
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "universityId": 1,
  "degree": "Computer Science",
  "year": "3rd",
  "gender": "Male",
  "skills": ["JavaScript", "React", "Node.js"]
}
```

### Explore & Matching

#### `GET /api/v1/explore/profiles`
Get explore profiles with matching algorithm
```
Query Parameters:
- limit: number (default: 20)
- offset: number (default: 0)
- search: string
- sortBy: 'match_score' | 'year_asc' | 'year_desc' | 'name_asc' | 'name_desc'
- gender: string
- years: string[]
- universities: string[]
- skills: string[]
```

#### `POST /api/v1/explore/adjectives/select`
Select adjective for a profile
```json
{
  "targetUserId": 123,
  "adjective": "Smart"
}
```

#### `GET /api/v1/explore/adjectives/matches`
Get adjective matches for current user

### Chat System

#### `GET /api/v1/chats/active`
Get active conversations (connected users)

#### `GET /api/v1/chats/matches`
Get matched conversations (adjective matches)

#### `GET /api/v1/chats/{conversationId}/messages`
Get conversation messages

#### `POST /api/v1/chats/{conversationId}/messages`
Send message
```json
{
  "text": "Hello! How are you?"
}
```

#### `POST /api/v1/chats/{conversationId}/read`
Mark messages as read

### Connection Management

#### `POST /api/v1/connections/manage`
Manage connection requests
```json
{
  "targetUserId": 123,
  "action": "connect" | "accept" | "reject" | "remove" | "block"
}
```

#### `GET /api/v1/connections/count`
Get connections count for authenticated user

### Payment Integration

#### `POST /api/v1/payments/create-order`
Create payment order
```json
{
  "amount": 1000,
  "currency": "INR",
  "receipt": "order_123"
}
```

#### `POST /api/v1/payments/verify`
Verify payment

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build           # Build TypeScript to JavaScript
npm run start           # Start production server

# Database
npm run get-simple-data # Get simple data for testing
npm run delete-users    # Delete test users
npm run reset-auto-increment # Reset database auto-increment

# Testing
npm run test-payment    # Test payment integration
```

### Database Migrations

```bash
# Run all migrations
npx sequelize-cli db:migrate

# Run specific migration
npx sequelize-cli db:migrate --to 20250101000000-create-connections.js

# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all
```

### Database Seeders

```bash
# Run all seeders
npx sequelize-cli db:seed:all

# Run specific seeder
npx sequelize-cli db:seed --seed 20230717-seed-universities.js

# Undo last seeder
npx sequelize-cli db:seed:undo

# Undo all seeders
npx sequelize-cli db:seed:undo:all
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Cross-origin resource sharing
- **Input Validation**: Request data validation
- **SQL Injection Protection**: Sequelize ORM with parameterized queries
- **File Upload Security**: Multer with file type validation
- **Environment Variables**: Secure configuration management

## 🌐 WebSocket Events

### Client to Server
- `send_message`: Send a new message
- `typing_start`: Start typing indicator
- `typing_stop`: Stop typing indicator
- `mark_as_read`: Mark messages as read

### Server to Client
- `new_message`: Receive new message
- `typing_start`: User started typing
- `typing_stop`: User stopped typing
- `user_online`: User came online
- `user_offline`: User went offline

## 📊 Database Schema

### Core Tables
- **users**: User profiles and authentication
- **universities**: University information
- **connections**: User connections and relationships
- **conversations**: Chat conversations
- **messages**: Chat messages
- **adjective_matches**: Adjective-based matching
- **interactions**: User interaction tracking
- **notifications**: System notifications
- **payments**: Payment transactions
- **user_images**: User profile images

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   - Set all required environment variables
   - Configure production database credentials
   - Set up AWS S3 and CloudFront
   - Configure payment gateway credentials

2. **Database Setup**
   ```bash
   npm run build
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation files in the project

## 🔄 Version History

- **v1.0.0**: Initial release with core features
- Authentication and user management
- Profile system with university integration
- Matching algorithm with adjective selection
- Real-time chat system
- Payment integration
- File upload and management

---

**Note**: This is a comprehensive backend system for a university student networking platform. Make sure to configure all environment variables and external services before running in production.
