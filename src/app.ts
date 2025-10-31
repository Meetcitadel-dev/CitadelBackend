import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import universityRoutes from './routes/university.routes';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import onboardingRoutes from './routes/onboarding.routes';
import exploreRoutes from './routes/explore.routes';
import enhancedExploreRoutes from './routes/enhancedExplore.routes';
import connectionsRoutes from './routes/connections.routes';
import notificationRoutes from './routes/notification.routes';
import userProfileRoutes from './routes/userProfile.routes';
import chatRoutes from './routes/chat.routes';
import enhancedChatRoutes from './routes/enhancedChat.routes';
import groupChatRoutes from './routes/groupChat.routes';
import paymentRoutes from './routes/payment.routes';
import quizRoutes from './routes/quiz.routes';
import dinnerPreferencesRoutes from './routes/dinnerPreferences.routes';
import dinnerEventsRoutes from './routes/dinnerEvents.routes';

const app = express();

// Helmet with permissive CORP for API usage
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// Loosen CSP for images so CloudFront/UploadThing can load
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      // Allow images from HTTPS and data URLs
      'img-src': ["'self'", 'https:', 'data:'],
    }
  })
);
app.use(express.json());
app.use(cookieParser());
// CORS configuration using environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
    'https://citadel-frontend-linp.vercel.app/',
    'http://localhost:5173/'
  ]; // Default allowed origins when env is missing

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser or same-origin
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));


// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server is working!' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/profile', profileRoutes); // Add alias for backward compatibility
app.use('/api/v1', universityRoutes);
app.use('/api/v1', onboardingRoutes);
app.use('/api/v1/explore', exploreRoutes);
app.use('/api/v1/enhanced-explore', enhancedExploreRoutes);
app.use('/api/v1/connections', connectionsRoutes); // Use dedicated connections routes
app.use('/api/v1', notificationRoutes); // Add notification routes
app.use('/api/v1/users', userProfileRoutes); // Add user profile routes
app.use('/api/v1/chats', chatRoutes); // Add chat routes
app.use('/api/v1/enhanced-chats', enhancedChatRoutes); // Add enhanced chat routes
app.use('/api/v1/group-chats', groupChatRoutes); // Add group chat routes
app.use('/api/v1/groups', groupChatRoutes); // Add alias for groups endpoint
app.use('/api/v1/payments', paymentRoutes); // Add payment routes
app.use('/api/payments', paymentRoutes); // Add alias for frontend compatibility
app.use('/api/v1/quiz', quizRoutes); // Add quiz routes
app.use('/api/v1/dinner-preferences', dinnerPreferencesRoutes); // Add dinner preferences routes
app.use('/api/v1/dinner-events', dinnerEventsRoutes); // Add dinner events routes

export default app;
