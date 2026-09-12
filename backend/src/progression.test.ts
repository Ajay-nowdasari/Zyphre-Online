import { describe, it, expect } from 'vitest';
import {
  calculateXpRequiredForLevel,
  calculateProgression,
  evaluateStreak,
  calculateStreakMultiplier,
  calculateAttributeBoosts,
  calculateShopDiscount,
} from './utils/progression.js';

describe('Life RPG Mathematical Progression Engine (SRS 4.3)', () => {
  it('strictly computes non-linear XP thresholds according to XP_req(L) = floor(100 * L^1.5)', () => {
    // Level 1: 100 * 1^1.5 = 100
    expect(calculateXpRequiredForLevel(1)).toBe(100);
    // Level 2: floor(100 * 2^1.5) = floor(100 * 2.828427) = 282
    expect(calculateXpRequiredForLevel(2)).toBe(282);
    // Level 3: floor(100 * 3^1.5) = floor(100 * 5.196152) = 519
    expect(calculateXpRequiredForLevel(3)).toBe(519);
    // Level 4: floor(100 * 4^1.5) = floor(100 * 8) = 800
    expect(calculateXpRequiredForLevel(4)).toBe(800);
    // Level 5: floor(100 * 5^1.5) = floor(100 * 11.180339) = 1118
    expect(calculateXpRequiredForLevel(5)).toBe(1118);
  });

  it('correctly calculates progression, level up, leftover XP, and stat/gold rewards', () => {
    // Starting at Level 1 with 40 XP, gaining 70 XP (Total 110 XP -> threshold for Level 1 is 100 XP)
    const result = calculateProgression(1, 40, 70);

    expect(result.newLevel).toBe(2);
    expect(result.levelsGained).toBe(1);
    expect(result.newCurrentXp).toBe(10); // 110 - 100 = 10 carryover
    expect(result.statPointsAwarded).toBe(5); // +5 stat points per level
    expect(result.bonusGoldAwarded).toBe(100); // Level 2 * 50 = 100 gold
    expect(result.xpRequiredForNextLevel).toBe(282);
  });

  it('handles multi-level jump from massive epic quest XP', () => {
    // Starting at Level 1 with 0 XP, gaining 500 XP
    // Level 1 takes 100 XP -> leaves 400 XP, becomes Level 2
    // Level 2 takes 282 XP -> leaves 118 XP, becomes Level 3
    const result = calculateProgression(1, 0, 500);

    expect(result.newLevel).toBe(3);
    expect(result.levelsGained).toBe(2);
    expect(result.newCurrentXp).toBe(118);
    expect(result.statPointsAwarded).toBe(10); // 2 * 5 = 10
    // Bonus gold: Level 2 (100) + Level 3 (150) = 250
    expect(result.bonusGoldAwarded).toBe(250);
  });
});

describe('Streak Engine & Safeguards (SRS 4.4)', () => {
  it('increments streak when completed on a consecutive calendar day', () => {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const result = evaluateStreak(3, yesterday, 1, new Date());
    expect(result.newStreak).toBe(4);
    expect(result.streakFreezeUsed).toBe(false);
    expect(result.streakReset).toBe(false);
  });

  it('maintains streak on multiple quest completions on the same day', () => {
    const today = new Date();
    const result = evaluateStreak(5, today, 1, today);
    expect(result.newStreak).toBe(5);
    expect(result.streakFreezeUsed).toBe(false);
    expect(result.streakReset).toBe(false);
  });

  it('uses a streak freeze to shield streak when a day is missed', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2);

    const result = evaluateStreak(7, twoDaysAgo, 1, new Date());
    expect(result.newStreak).toBe(7);
    expect(result.streakFreezeUsed).toBe(true);
    expect(result.streakReset).toBe(false);
  });

  it('resets streak to 1 when a day is missed without a streak freeze', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2);

    const result = evaluateStreak(7, twoDaysAgo, 0, new Date());
    expect(result.newStreak).toBe(1);
    expect(result.streakFreezeUsed).toBe(false);
    expect(result.streakReset).toBe(true);
  });

  it('computes correct streak multiplier with cap', () => {
    expect(calculateStreakMultiplier(1)).toBe(1.0);
    expect(calculateStreakMultiplier(2)).toBe(1.05);
    expect(calculateStreakMultiplier(5)).toBe(1.2);
    expect(calculateStreakMultiplier(11)).toBe(1.5);
    expect(calculateStreakMultiplier(20)).toBe(1.5); // Capped at 1.5x (+50%)
  });
});

describe('Attribute Perks & Shop Discounts', () => {
  it('calculates Intellect and Strength perks', () => {
    const boosts = calculateAttributeBoosts(20, 30);
    // Intellect 20: (20 - 10) * 0.005 = +5%
    expect(boosts.xpMultiplier).toBeCloseTo(1.05);
    // Strength 30: (30 - 10) * 0.005 = +10%
    expect(boosts.goldMultiplier).toBeCloseTo(1.1);
  });

  it('calculates Charisma shop discounts with cap', () => {
    expect(calculateShopDiscount(10)).toBe(0);
    // Charisma 20: 10 * 0.005 = 5% discount
    expect(calculateShopDiscount(20)).toBeCloseTo(0.05);
    // Charisma 100: capped at 25% discount
    expect(calculateShopDiscount(100)).toBe(0.25);
  });
});
