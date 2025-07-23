import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import universityRoutes from './routes/university.routes';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(universityRoutes);
app.use(authRoutes);

export default app;
