import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { CHARACTER_CLASSES, STORY_CHAPTERS } from '../config/roleplay.js';

const router = Router();

// GET /api/roleplay/classes - Get list of character classes
router.get('/classes', (req, res) => {
  res.json({ classes: Object.values(CHARACTER_CLASSES) });
});

// PUT /api/roleplay/class - Select or change character class
router.put('/class', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { characterClass } = req.body;
    const classDef = CHARACTER_CLASSES[characterClass];

    if (!classDef) {
      res.status(400).json({ error: 'Invalid character class specified' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        characterClass: classDef.key,
        characterTitle: classDef.title,
      },
      include: {
        attributes: true,
        inventory: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.userId!,
        actionType: 'CLASS_SELECTED',
        details: JSON.stringify({
          className: classDef.name,
          classTitle: classDef.title,
          perk: classDef.perkName,
        }),
      },
    });

    res.json({ user: updatedUser, classDef });
  } catch (error: any) {
    console.error('Update class error:', error);
    res.status(500).json({ error: 'Failed to update character class' });
  }
});

// GET /api/roleplay/campaign - Story campaign progression
router.get('/campaign', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const chapters = STORY_CHAPTERS.map((ch) => ({
      ...ch,
      isUnlocked: user.level >= ch.requiredLevel,
      isCurrent: user.level === ch.requiredLevel,
    }));

    res.json({
      currentLevel: user.level,
      characterClass: user.characterClass,
      characterTitle: user.characterTitle,
      chapters,
    });
  } catch (error: any) {
    console.error('Campaign fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// GET /api/roleplay/boss - Get active Boss Raid
router.get('/boss', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.userId!;

    // Find or initialize active boss raid
    let boss = await prisma.bossRaid.findFirst({
      where: { userId, isDefeated: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!boss) {
      // Find count of previously defeated bosses to scale level
      const defeatedCount = await prisma.bossRaid.count({
        where: { userId, isDefeated: true },
      });

      const bossLevel = defeatedCount + 1;
      const bossMaxHp = 1000 + (bossLevel - 1) * 1000;
      const bossNames = [
        'Chronos, Devourer of Hours',
        'The Burnout Leviathan',
        'Phantom of Impostor Doubt',
        'The Gorgon of Infinite Distraction',
      ];
      const bossName = bossNames[(bossLevel - 1) % bossNames.length];

      boss = await prisma.bossRaid.create({
        data: {
          userId,
          bossName,
          bossTitle: `Tier ${bossLevel} World Behemoth`,
          currentHp: bossMaxHp,
          maxHp: bossMaxHp,
          bossLevel,
          isDefeated: false,
        },
      });
    }

    res.json({ boss });
  } catch (error: any) {
    console.error('Boss fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch boss raid' });
  }
});

export default router;
