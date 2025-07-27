import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import universityRoutes from './routes/university.routes';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import onboardingRoutes from './routes/onboarding.routes';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', universityRoutes); // Mount university routes before onboarding
app.use('/api/v1', onboardingRoutes);

export default app;
