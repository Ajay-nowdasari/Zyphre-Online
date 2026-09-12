import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import {
  DIFFICULTY_REWARDS,
  DifficultyTier,
  TARGET_ATTRIBUTES,
  TargetAttribute,
  RECURRENCE_TYPES,
  RecurrenceType,
} from '../config/constants.js';
import {
  calculateProgression,
  evaluateStreak,
  calculateStreakMultiplier,
  calculateAttributeBoosts,
  calculateXpRequiredForLevel,
} from '../utils/progression.js';

const router = Router();

const createQuestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().max(500).optional(),
  difficulty: z.enum(['TRIVIAL', 'EASY', 'MEDIUM', 'HARD', 'EPIC']),
  targetAttribute: z.enum(['INTELLECT', 'STRENGTH', 'VITALITY', 'CHARISMA']),
  recurrence: z.enum(['ONE_TIME', 'DAILY', 'WEEKLY']).default('DAILY'),
  dueDate: z.string().optional().nullable(),
});

const updateQuestSchema = createQuestSchema.partial();

// GET /api/quests
router.get('/', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { status, recurrence, targetAttribute } = req.query;

    const whereClause: any = { userId: req.userId };
    if (status && typeof status === 'string') whereClause.status = status;
    if (recurrence && typeof recurrence === 'string') whereClause.recurrence = recurrence;
    if (targetAttribute && typeof targetAttribute === 'string')
      whereClause.targetAttribute = targetAttribute;

    const quests = await prisma.quest.findMany({
      where: whereClause,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({ quests });
  } catch (error: any) {
    console.error('Fetch quests error:', error);
    res.status(500).json({ error: 'Failed to fetch quests' });
  }
});

// POST /api/quests - Create Quest
router.post('/', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const parseResult = createQuestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { title, description, difficulty, targetAttribute, recurrence, dueDate } =
      parseResult.data;

    // Server-Side Reward Calculation (Zero-Trust Anti-Cheat)
    const rewards = DIFFICULTY_REWARDS[difficulty as DifficultyTier];

    const quest = await prisma.quest.create({
      data: {
        userId: req.userId!,
        title,
        description: description || null,
        difficulty,
        targetAttribute,
        rewardXp: rewards.xp,
        rewardGold: rewards.gold,
        recurrence,
        status: 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    res.status(201).json({ quest });
  } catch (error: any) {
    console.error('Create quest error:', error);
    res.status(500).json({ error: 'Failed to create quest' });
  }
});

// PUT /api/quests/:id - Update Quest
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const id = req.params.id as string;
    const parseResult = updateQuestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const existingQuest = await prisma.quest.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existingQuest) {
      res.status(404).json({ error: 'Quest not found' });
      return;
    }

    const updateData: any = { ...parseResult.data };

    if (parseResult.data.difficulty) {
      const rewards = DIFFICULTY_REWARDS[parseResult.data.difficulty as DifficultyTier];
      updateData.rewardXp = rewards.xp;
      updateData.rewardGold = rewards.gold;
    }

    if (parseResult.data.dueDate !== undefined) {
      updateData.dueDate = parseResult.data.dueDate ? new Date(parseResult.data.dueDate) : null;
    }

    const updated = await prisma.quest.update({
      where: { id },
      data: updateData,
    });

    res.json({ quest: updated });
  } catch (error: any) {
    console.error('Update quest error:', error);
    res.status(500).json({ error: 'Failed to update quest' });
  }
});

// DELETE /api/quests/:id
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const id = req.params.id as string;
    const quest = await prisma.quest.findFirst({
      where: { id, userId: req.userId },
    });

    if (!quest) {
      res.status(404).json({ error: 'Quest not found' });
      return;
    }

    await prisma.quest.delete({ where: { id } });
    res.json({ message: 'Quest deleted successfully' });
  } catch (error: any) {
    console.error('Delete quest error:', error);
    res.status(500).json({ error: 'Failed to delete quest' });
  }
});

// POST /api/quests/:id/reset - Reset a completed daily/weekly quest
router.post('/:id/reset', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const id = req.params.id as string;
    const quest = await prisma.quest.findFirst({
      where: { id, userId: req.userId },
    });

    if (!quest) {
      res.status(404).json({ error: 'Quest not found' });
      return;
    }

    const resetQuest = await prisma.quest.update({
      where: { id },
      data: {
        status: 'PENDING',
        completedAt: null,
      },
    });

    res.json({ quest: resetQuest });
  } catch (error: any) {
    console.error('Reset quest error:', error);
    res.status(500).json({ error: 'Failed to reset quest' });
  }
});

// POST /api/quests/:id/complete - Complete Quest with Strict Server Validation
router.post('/:id/complete', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    // 1. Fetch quest and user with current stats in ACID transaction
    const result = await prisma.$transaction(async (tx) => {
      const quest = await tx.quest.findFirst({
        where: { id, userId },
      });

      if (!quest) {
        throw new Error('Quest not found');
      }

      if (quest.status === 'COMPLETED') {
        throw new Error('Quest has already been marked completed');
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { attributes: true },
      });

      if (!user || !user.attributes) {
        throw new Error('User account or attributes missing');
      }

      // 2. Evaluate streak
      const streakResult = evaluateStreak(
        user.streakCount,
        user.lastCompletionDate,
        user.streakFreezeCount
      );

      const streakMultiplier = calculateStreakMultiplier(streakResult.newStreak);

      // 3. Calculate attribute perks
      const { xpMultiplier, goldMultiplier } = calculateAttributeBoosts(
        user.attributes.intellect,
        user.attributes.strength
      );

      // 4. Calculate final rewards server-side
      const baseRewards = DIFFICULTY_REWARDS[quest.difficulty as DifficultyTier] || {
        xp: quest.rewardXp,
        gold: quest.rewardGold,
      };

      const finalXp = Math.floor(baseRewards.xp * streakMultiplier * xpMultiplier);
      const finalGold = Math.floor(baseRewards.gold * streakMultiplier * goldMultiplier);

      // 5. Progression math formula (SRS 4.3)
      const progression = calculateProgression(user.level, user.currentXp, finalXp);

      // 6. Update user's target attribute score (+1 point in target stat)
      const attributeUpdateData: any = {};
      const targetAttr = quest.targetAttribute.toLowerCase();
      if (targetAttr === 'intellect') attributeUpdateData.intellect = { increment: 1 };
      else if (targetAttr === 'strength') attributeUpdateData.strength = { increment: 1 };
      else if (targetAttr === 'vitality') attributeUpdateData.vitality = { increment: 1 };
      else if (targetAttr === 'charisma') attributeUpdateData.charisma = { increment: 1 };

      await tx.attributes.update({
        where: { userId },
        data: attributeUpdateData,
      });

      // 7. Deduct streak freeze if used
      const updatedFreezeCount = streakResult.streakFreezeUsed
        ? Math.max(0, user.streakFreezeCount - 1)
        : user.streakFreezeCount;

      // 8.5 Roleplay Combat: Deal damage to active World Boss
      let bossDamage = 0;
      let bossDefeated = false;
      let bossDefeatedBonusGold = 0;
      let activeBoss = await tx.bossRaid.findFirst({
        where: { userId, isDefeated: false },
        orderBy: { createdAt: 'desc' },
      });

      if (activeBoss) {
        const attrVal =
          targetAttr === 'intellect'
            ? user.attributes.intellect
            : targetAttr === 'strength'
            ? user.attributes.strength
            : targetAttr === 'vitality'
            ? user.attributes.vitality
            : user.attributes.charisma;

        bossDamage = Math.floor(finalXp * (1 + attrVal / 25));
        const remainingHp = Math.max(0, activeBoss.currentHp - bossDamage);
        bossDefeated = remainingHp === 0;

        if (bossDefeated) {
          bossDefeatedBonusGold = 250;
          await tx.bossRaid.update({
            where: { id: activeBoss.id },
            data: { currentHp: 0, isDefeated: true },
          });
        } else {
          await tx.bossRaid.update({
            where: { id: activeBoss.id },
            data: { currentHp: remainingHp },
          });
        }
      }

      // 8. Update User stats
      const totalBonusGold = progression.bonusGoldAwarded + bossDefeatedBonusGold;
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          level: progression.newLevel,
          currentXp: progression.newCurrentXp,
          currentGold: { increment: finalGold + totalBonusGold },
          lifetimeGold: { increment: finalGold + totalBonusGold },
          streakCount: streakResult.newStreak,
          streakFreezeCount: updatedFreezeCount,
          lastCompletionDate: new Date(),
          unspentStatPoints: { increment: progression.statPointsAwarded },
        },
        include: {
          attributes: true,
          inventory: true,
        },
      });

      // 9. Mark Quest as Completed
      const completedQuest = await tx.quest.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // 10. Write Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          actionType: progression.levelsGained > 0 ? 'LEVEL_UP' : 'QUEST_COMPLETED',
          xpDelta: finalXp,
          goldDelta: finalGold + totalBonusGold,
          details: JSON.stringify({
            questId: quest.id,
            questTitle: quest.title,
            difficulty: quest.difficulty,
            targetAttribute: quest.targetAttribute,
            streakMultiplier,
            newStreak: streakResult.newStreak,
            streakFreezeUsed: streakResult.streakFreezeUsed,
            leveledUp: progression.levelsGained > 0,
            newLevel: progression.newLevel,
            statPointsAwarded: progression.statPointsAwarded,
            bonusGoldAwarded: totalBonusGold,
          }),
        },
      });

      return {
        completedQuest,
        updatedUser,
        rewardSummary: {
          xpEarned: finalXp,
          goldEarned: finalGold,
          bonusGoldEarned: totalBonusGold,
          streakMultiplier,
          currentStreak: streakResult.newStreak,
          streakMessage: streakResult.message,
          streakFreezeUsed: streakResult.streakFreezeUsed,
          leveledUp: progression.levelsGained > 0,
          levelsGained: progression.levelsGained,
          newLevel: progression.newLevel,
          statPointsAwarded: progression.statPointsAwarded,
          xpRequiredForNextLevel: progression.xpRequiredForNextLevel,
          bossCombat: {
            damageDealt: bossDamage,
            bossDefeated,
            bossDefeatedBonusGold,
            bossName: activeBoss?.bossName || 'World Boss',
          },
        },
      };
    });

    res.json(result);
  } catch (error: any) {
    console.error('Complete quest error:', error);
    res.status(400).json({ error: error.message || 'Failed to complete quest' });
  }
});

export default router;
