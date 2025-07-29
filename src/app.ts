import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import universityRoutes from './routes/university.routes';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import onboardingRoutes from './routes/onboarding.routes';
import exploreRoutes from './routes/explore.routes';
import connectionsRoutes from './routes/connections.routes';
import notificationRoutes from './routes/notification.routes';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/profile', profileRoutes); // Add alias for backward compatibility
app.use('/api/v1', universityRoutes);
app.use('/api/v1', onboardingRoutes);
app.use('/api/v1/explore', exploreRoutes);
app.use('/api/v1/connections', connectionsRoutes); // Use dedicated connections routes
app.use('/api/v1', notificationRoutes); // Add notification routes

export default app;
