import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-life-rpg-change-in-prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(2, 'Username must be at least 2 characters').max(30),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function sendAuthCookieAndResponse(res: Response, user: any, token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  const { passwordHash, ...safeUser } = user;
  return res.json({
    user: safeUser,
    token,
  });
}

// POST /api/auth/register
router.post('/register', async (req, res): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { email, password, username } = parseResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(400).json({ error: 'An account with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with default attributes and starting inventory item in a transaction
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        username,
        level: 1,
        currentXp: 0,
        currentGold: 50,
        lifetimeGold: 50,
        streakCount: 0,
        streakFreezeCount: 1,
        unspentStatPoints: 0,
        activeTheme: 'CYBERPUNK',
        attributes: {
          create: {
            intellect: 10,
            strength: 10,
            vitality: 10,
            charisma: 10,
          },
        },
        inventory: {
          create: [
            {
              itemKey: 'THEME_CYBERPUNK',
              name: 'Cyberpunk Neon Theme',
              category: 'THEME',
              isEquipped: true,
            },
          ],
        },
        // Starter quests
        quests: {
          create: [
            {
              title: 'Master the Terminal Protocol',
              description: 'Complete 45 minutes of deep coding or software architecture design.',
              difficulty: 'MEDIUM',
              targetAttribute: 'INTELLECT',
              rewardXp: 100,
              rewardGold: 50,
              recurrence: 'DAILY',
            },
            {
              title: 'Kinetic Conditioning',
              description: 'Engage in a rigorous 30-minute workout, run, or bodyweight training.',
              difficulty: 'MEDIUM',
              targetAttribute: 'STRENGTH',
              rewardXp: 100,
              rewardGold: 50,
              recurrence: 'DAILY',
            },
            {
              title: 'Deep Slumber Ritual',
              description: 'Get 8 hours of restorative sleep and awaken before 08:00.',
              difficulty: 'EASY',
              targetAttribute: 'VITALITY',
              rewardXp: 50,
              rewardGold: 20,
              recurrence: 'DAILY',
            },
            {
              title: 'Guild Leadership & Communication',
              description: 'Lead a team sync, mentor a colleague, or practice public speaking.',
              difficulty: 'EASY',
              targetAttribute: 'CHARISMA',
              rewardXp: 50,
              rewardGold: 20,
              recurrence: 'WEEKLY',
            },
          ],
        },
        customRewards: {
          create: [
            {
              title: '1 Hour Immersive Gaming Session',
              description: 'Indulge in your favorite game guilt-free after hitting your quests.',
              cost: 100,
              icon: 'Gamepad2',
            },
            {
              title: 'Artisan Espresso / Cafe Treat',
              description: 'Treat yourself to high-grade fuel at your local coffee sanctuary.',
              cost: 60,
              icon: 'Coffee',
            },
          ],
        },
      },
      include: {
        attributes: true,
        inventory: true,
      },
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendAuthCookieAndResponse(res, newUser, token);
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        attributes: true,
        inventory: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendAuthCookieAndResponse(res, user, token);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        attributes: true,
        inventory: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error: any) {
    console.error('Fetch me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Successfully logged out' });
});

export default router;
