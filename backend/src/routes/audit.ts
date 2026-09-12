import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/audit
router.get('/', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ logs });
  } catch (error: any) {
    console.error('Fetch audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
