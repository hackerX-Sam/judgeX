import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'JudgeX Backend is running!' });
});

// Root route so the user doesn't see "Cannot GET /"
app.get('/', (req, res) => {
  res.send('<h1>JudgeX Backend is running!</h1><p>Visit <a href="/api/health">/api/health</a> for health check.</p>');
});

import authRoutes from './routes/auth.routes';
import problemRoutes from './routes/problem.routes';
import submissionRoutes from './routes/submission.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);

export default app;
