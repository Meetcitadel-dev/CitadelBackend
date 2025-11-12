import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';

// Routes
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
import eventManagementRoutes from './routes/eventManagement.routes';

const app = express();

/* ------------------------------- SECURITY --------------------------------- */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'https:', 'data:'], // allow images from HTTPS and data URLs
    },
  })
);

app.use(express.json());
app.use(cookieParser());

/* ------------------------------- CORS CONFIG ------------------------------ */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : [
      'https://citadel-frontend-linp.vercel.app',
      'http://localhost:5173',
    ]; // default allowed origins

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser or same-origin requests
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`❌ Blocked by CORS: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
};

// ✅ Use CORS middleware
app.use(cors(corsOptions));

// Preflight requests are handled by CORS middleware above

/* ----------------------------- FALLBACK CORS ------------------------------ */
// (helps when Render proxies strip headers)
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin as string | undefined;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/* ----------------------------- TEST ENDPOINT ------------------------------ */
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ success: true, message: '✅ Server is working properly!' });
});

/* ----------------------------- REGISTER ROUTES ---------------------------- */
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/v1', universityRoutes);
app.use('/api/v1', onboardingRoutes);
app.use('/api/v1/explore', exploreRoutes);
app.use('/api/v1/enhanced-explore', enhancedExploreRoutes);
app.use('/api/v1/connections', connectionsRoutes);
app.use('/api/v1', notificationRoutes);
app.use('/api/v1/users', userProfileRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/enhanced-chats', enhancedChatRoutes);
app.use('/api/v1/group-chats', groupChatRoutes);
app.use('/api/v1/groups', groupChatRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/v1/quiz', quizRoutes);
app.use('/api/v1/dinner-preferences', dinnerPreferencesRoutes);
app.use('/api/v1/dinner-events', dinnerEventsRoutes);
app.use('/api/v1/event-management', eventManagementRoutes);

/* ---------------------------- ERROR HANDLING ------------------------------ */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Server Error:', err.message);
  if (err.message.includes('CORS')) {
    return res.status(403).json({ success: false, error: 'CORS blocked' });
  }
  res.status(500).json({ success: false, message: err.message });
});

export default app;
