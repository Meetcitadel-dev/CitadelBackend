import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import connectMongoDB from './config/mongodb';
import universityRoutes from './routes/university.routes';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import onboardingRoutes from './routes/onboarding.routes';
import exploreRoutes from './routes/explore.routes';
import connectionsRoutes from './routes/connections.routes';
import notificationRoutes from './routes/notification.routes';
import userProfileRoutes from './routes/userProfile.routes';
import chatRoutes from './routes/chat.routes';
import paymentRoutes from './routes/payment.routes';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Connect to MongoDB
connectMongoDB();

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
app.use('/api/v1/connections', connectionsRoutes); // Use dedicated connections routes
app.use('/api/v1', notificationRoutes); // Add notification routes
app.use('/api/v1/users', userProfileRoutes); // Add user profile routes
app.use('/api/v1/chats', chatRoutes); // Add chat routes
app.use('/api/v1/payments', paymentRoutes); // Add payment routes
app.use('/api/payments', paymentRoutes); // Add alias for frontend compatibility

export default app;
