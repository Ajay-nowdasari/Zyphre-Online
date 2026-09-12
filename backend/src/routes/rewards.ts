import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const createRewardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(300).optional(),
  cost: z.number().int().min(1, 'Cost must be at least 1 Gold').max(10000),
  icon: z.string().default('Gift'),
});

// GET /api/rewards/custom
router.get('/custom', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const rewards = await prisma.customReward.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ rewards });
  } catch (error: any) {
    console.error('Fetch custom rewards error:', error);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

// POST /api/rewards/custom
router.post('/custom', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const parseResult = createRewardSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { title, description, cost, icon } = parseResult.data;

    const reward = await prisma.customReward.create({
      data: {
        userId: req.userId!,
        title,
        description: description || null,
        cost,
        icon,
      },
    });

    res.status(201).json({ reward });
  } catch (error: any) {
    console.error('Create reward error:', error);
    res.status(500).json({ error: 'Failed to create reward' });
  }
});

// DELETE /api/rewards/custom/:id
router.delete('/custom/:id', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const id = req.params.id as string;
    const reward = await prisma.customReward.findFirst({
      where: { id, userId: req.userId },
    });

    if (!reward) {
      res.status(404).json({ error: 'Reward not found' });
      return;
    }

    await prisma.customReward.delete({ where: { id } });
    res.json({ message: 'Reward deleted successfully' });
  } catch (error: any) {
    console.error('Delete reward error:', error);
    res.status(500).json({ error: 'Failed to delete reward' });
  }
});

// POST /api/rewards/custom/:id/claim - Redeem real-world reward using earned gold
router.post('/custom/:id/claim', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    const result = await prisma.$transaction(async (tx) => {
      const reward = await tx.customReward.findFirst({
        where: { id, userId },
      });

      if (!reward) {
        throw new Error('Reward not found');
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.currentGold < reward.cost) {
        throw new Error(
          `Insufficient Gold. Required: ${reward.cost} Gold, Current balance: ${user.currentGold} Gold`
        );
      }

      // Deduct gold
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { currentGold: { decrement: reward.cost } },
        include: { attributes: true, inventory: true },
      });

      // Increment redemption count
      const updatedReward = await tx.customReward.update({
        where: { id },
        data: { timesRedeemed: { increment: 1 } },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          actionType: 'REWARD_REDEEMED',
          goldDelta: -reward.cost,
          details: JSON.stringify({
            rewardId: reward.id,
            rewardTitle: reward.title,
            cost: reward.cost,
            timesRedeemed: updatedReward.timesRedeemed,
          }),
        },
      });

      return {
        message: `Successfully redeemed "${reward.title}"! Enjoy your well-earned reward!`,
        reward: updatedReward,
        user: updatedUser,
      };
    });

    res.json(result);
  } catch (error: any) {
    console.error('Claim reward error:', error);
    res.status(400).json({ error: error.message || 'Failed to claim reward' });
  }
});

export default router;
