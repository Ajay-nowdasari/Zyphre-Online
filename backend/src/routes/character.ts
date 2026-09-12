import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { calculateXpRequiredForLevel, calculateStreakMultiplier } from '../utils/progression.js';

const router = Router();

// GET /api/character
router.get('/', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        attributes: true,
        inventory: true,
      },
    });

    if (!user || !user.attributes) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    const xpRequiredForCurrentLevel = calculateXpRequiredForLevel(user.level);
    const streakMultiplier = calculateStreakMultiplier(user.streakCount);

    const { passwordHash, ...characterData } = user;

    res.json({
      character: {
        ...characterData,
        xpRequiredForCurrentLevel,
        streakMultiplier,
      },
    });
  } catch (error: any) {
    console.error('Fetch character error:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

const allocateStatsSchema = z.object({
  intellect: z.number().int().nonnegative().default(0),
  strength: z.number().int().nonnegative().default(0),
  vitality: z.number().int().nonnegative().default(0),
  charisma: z.number().int().nonnegative().default(0),
});

// POST /api/character/allocate-stats
router.post('/allocate-stats', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const parseResult = allocateStatsSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { intellect, strength, vitality, charisma } = parseResult.data;
    const totalPointsToSpend = intellect + strength + vitality + charisma;

    if (totalPointsToSpend <= 0) {
      res.status(400).json({ error: 'Please specify at least 1 attribute point to allocate' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: req.userId },
        include: { attributes: true },
      });

      if (!user || !user.attributes) {
        throw new Error('User not found');
      }

      if (user.unspentStatPoints < totalPointsToSpend) {
        throw new Error(
          `Insufficient unspent stat points. Available: ${user.unspentStatPoints}, requested: ${totalPointsToSpend}`
        );
      }

      // Deduct unspent points from user
      const updatedUser = await tx.user.update({
        where: { id: req.userId },
        data: {
          unspentStatPoints: { decrement: totalPointsToSpend },
        },
      });

      // Increment attributes
      const updatedAttributes = await tx.attributes.update({
        where: { userId: req.userId },
        data: {
          intellect: { increment: intellect },
          strength: { increment: strength },
          vitality: { increment: vitality },
          charisma: { increment: charisma },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: req.userId!,
          actionType: 'STATS_ALLOCATED',
          details: JSON.stringify({
            intellectAdded: intellect,
            strengthAdded: strength,
            vitalityAdded: vitality,
            charismaAdded: charisma,
            remainingPoints: updatedUser.unspentStatPoints,
          }),
        },
      });

      return {
        user: updatedUser,
        attributes: updatedAttributes,
      };
    });

    res.json(result);
  } catch (error: any) {
    console.error('Allocate stats error:', error);
    res.status(400).json({ error: error.message || 'Failed to allocate stats' });
  }
});

// POST /api/character/equip - Equip or unequip 3D gear or cosmetics
router.post('/equip', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { itemKey, equip } = req.body;
    if (!itemKey) {
      res.status(400).json({ error: 'itemKey is required' });
      return;
    }

    const item = await prisma.inventoryItem.findFirst({
      where: { userId: req.userId, itemKey },
    });

    if (!item) {
      res.status(404).json({ error: 'Item not found in inventory. Purchase it in the shop first!' });
      return;
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: item.id },
      data: { isEquipped: equip !== undefined ? Boolean(equip) : !item.isEquipped },
    });

    res.json({ item: updatedItem });
  } catch (error: any) {
    console.error('Equip item error:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

// PUT /api/character/theme - Set active theme
router.put('/theme', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { theme } = req.body;
    if (!['CYBERPUNK', 'LOFI', 'RETRO_DUNGEON'].includes(theme)) {
      res.status(400).json({ error: 'Invalid theme specified' });
      return;
    }

    // Default theme CYBERPUNK is free; others require inventory ownership
    if (theme !== 'CYBERPUNK') {
      const themeKey = `THEME_${theme}`;
      const owned = await prisma.inventoryItem.findFirst({
        where: { userId: req.userId, itemKey: themeKey },
      });

      if (!owned) {
        res.status(403).json({
          error: `You do not own the ${theme} theme. Unlock it in the Virtual Shop!`,
        });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { activeTheme: theme },
    });

    res.json({ activeTheme: updatedUser.activeTheme });
  } catch (error: any) {
    console.error('Change theme error:', error);
    res.status(500).json({ error: 'Failed to update active theme' });
  }
});

export default router;
