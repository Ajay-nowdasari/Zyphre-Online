import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    level: number;
    currentGold: number;
  };
}

interface JwtPayload {
  userId: string;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-life-rpg-change-in-prod';

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      res.status(401).json({ error: 'Unauthorized: No authentication token provided' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!decoded || !decoded.userId) {
      res.status(401).json({ error: 'Unauthorized: Invalid token signature' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        level: true,
        currentGold: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Unauthorized: User account not found' });
      return;
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
    return;
  }
}
