import { PROGRESSION_CONFIG } from '../config/constants.js';

/**
 * Calculates the XP required to reach Level L.
 * Formula from SRS 4.3:
 * XP_required(L) = BaseXP * L^(growth_factor)
 * where BaseXP = 100, growth_factor = 1.5
 */
export function calculateXpRequiredForLevel(level: number): number {
  if (level < 1) return PROGRESSION_CONFIG.BASE_XP;
  return Math.floor(
    PROGRESSION_CONFIG.BASE_XP * Math.pow(level, PROGRESSION_CONFIG.GROWTH_FACTOR)
  );
}

export interface ProgressionResult {
  newLevel: number;
  newCurrentXp: number;
  levelsGained: number;
  bonusGoldAwarded: number;
  statPointsAwarded: number;
  xpRequiredForNextLevel: number;
}

/**
 * Calculates level up and remaining XP when XP is gained.
 */
export function calculateProgression(
  currentLevel: number,
  currentXp: number,
  xpGained: number
): ProgressionResult {
  let level = currentLevel;
  let totalAvailableXp = currentXp + xpGained;
  let levelsGained = 0;
  let bonusGoldAwarded = 0;
  let statPointsAwarded = 0;

  // Check if XP crosses the threshold for the current level
  while (true) {
    const requiredForCurrentLevel = calculateXpRequiredForLevel(level);
    if (totalAvailableXp >= requiredForCurrentLevel) {
      totalAvailableXp -= requiredForCurrentLevel;
      level += 1;
      levelsGained += 1;
      statPointsAwarded += PROGRESSION_CONFIG.STAT_POINTS_PER_LEVEL;
      bonusGoldAwarded += level * PROGRESSION_CONFIG.BONUS_GOLD_PER_LEVEL_FACTOR;
    } else {
      break;
    }
  }

  return {
    newLevel: level,
    newCurrentXp: totalAvailableXp,
    levelsGained,
    bonusGoldAwarded,
    statPointsAwarded,
    xpRequiredForNextLevel: calculateXpRequiredForLevel(level),
  };
}

export interface StreakEvaluationResult {
  newStreak: number;
  streakFreezeUsed: boolean;
  streakReset: boolean;
  message: string;
}

/**
 * Evaluates streak based on calendar day difference (SRS 4.4).
 * If consecutive calendar day: streak + 1
 * If same calendar day: streak unchanged
 * If missed >= 1 day: check if streak freeze is available
 */
export function evaluateStreak(
  currentStreak: number,
  lastCompletionDate: Date | null,
  streakFreezeCount: number,
  now: Date = new Date()
): StreakEvaluationResult {
  if (!lastCompletionDate) {
    return {
      newStreak: 1,
      streakFreezeUsed: false,
      streakReset: false,
      message: 'First quest completed! Streak initiated.',
    };
  }

  // Compare calendar dates in UTC to avoid timezone drift
  const lastUtc = new Date(
    Date.UTC(
      lastCompletionDate.getUTCFullYear(),
      lastCompletionDate.getUTCMonth(),
      lastCompletionDate.getUTCDate()
    )
  );
  const nowUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  const diffMs = nowUtc.getTime() - lastUtc.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day: streak maintained
    return {
      newStreak: Math.max(currentStreak, 1),
      streakFreezeUsed: false,
      streakReset: false,
      message: 'Daily streak preserved!',
    };
  } else if (diffDays === 1) {
    // Consecutive day: streak increments
    return {
      newStreak: currentStreak + 1,
      streakFreezeUsed: false,
      streakReset: false,
      message: `Streak continued! ${currentStreak + 1} day streak!`,
    };
  } else {
    // Missed 1 or more calendar days
    if (streakFreezeCount > 0) {
      return {
        newStreak: Math.max(currentStreak, 1),
        streakFreezeUsed: true,
        streakReset: false,
        message: 'Aegis Streak Freeze activated! Your streak was saved from resetting.',
      };
    } else {
      return {
        newStreak: 1,
        streakFreezeUsed: false,
        streakReset: true,
        message: 'Streak expired and has been reset to 1. Acquire Streak Freezes in the shop to protect it next time!',
      };
    }
  }
}

/**
 * Computes streak multiplier boost:
 * Multiplier = 1.0 + min(streak * 0.05, 0.50) (up to +50% bonus)
 */
export function calculateStreakMultiplier(streak: number): number {
  if (streak <= 1) return 1.0;
  const bonus = Math.min((streak - 1) * 0.05, 0.5);
  return Number((1.0 + bonus).toFixed(2));
}

/**
 * Calculates attribute stat multiplier perks:
 * Intellect boosts XP gain (+0.5% per point above 10)
 * Strength boosts Gold gain (+0.5% per point above 10)
 */
export function calculateAttributeBoosts(intellect: number, strength: number) {
  const intellectBonus = Math.max(0, (intellect - 10) * 0.005);
  const strengthBonus = Math.max(0, (strength - 10) * 0.005);
  return {
    xpMultiplier: 1.0 + intellectBonus,
    goldMultiplier: 1.0 + strengthBonus,
  };
}

/**
 * Charisma gives shop discount (+0.5% per point above 10, max 25%)
 */
export function calculateShopDiscount(charisma: number): number {
  const bonus = Math.max(0, (charisma - 10) * 0.005);
  return Math.min(0.25, bonus);
}
