import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import questsRouter from './routes/quests.js';
import characterRouter from './routes/character.js';
import shopRouter from './routes/shop.js';
import rewardsRouter from './routes/rewards.js';
import auditRouter from './routes/audit.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(
  cors({
    origin: [CORS_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Life RPG Backend Engine',
  });
});

// Root API Info
app.get('/api', (req, res) => {
  res.json({
    name: 'Life RPG Gamified Productivity API',
    version: '1.0.0',
    documentation: 'Strict server-side validation and anti-cheat progression engine',
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/quests', questsRouter);
app.use('/api/character', characterRouter);
app.use('/api/shop', shopRouter);
app.use('/api/rewards', rewardsRouter);
app.use('/api/audit', auditRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error occurred' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`⚔️ Life RPG Backend API listening on port ${PORT}`);
  });
}

export default app;
