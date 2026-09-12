export const PROGRESSION_CONFIG = {
  BASE_XP: 100,
  GROWTH_FACTOR: 1.5,
  STAT_POINTS_PER_LEVEL: 5,
  BONUS_GOLD_PER_LEVEL_FACTOR: 50,
} as const;

export const DIFFICULTY_REWARDS = {
  TRIVIAL: { xp: 25, gold: 10 },
  EASY: { xp: 50, gold: 20 },
  MEDIUM: { xp: 100, gold: 50 },
  HARD: { xp: 200, gold: 100 },
  EPIC: { xp: 400, gold: 250 },
} as const;

export type DifficultyTier = keyof typeof DIFFICULTY_REWARDS;

export const TARGET_ATTRIBUTES = ['INTELLECT', 'STRENGTH', 'VITALITY', 'CHARISMA'] as const;
export type TargetAttribute = (typeof TARGET_ATTRIBUTES)[number];

export const RECURRENCE_TYPES = ['ONE_TIME', 'DAILY', 'WEEKLY'] as const;
export type RecurrenceType = (typeof RECURRENCE_TYPES)[number];

export const SHOP_CATALOG = [
  // THEMES (SRS 2 & 4.4)
  {
    itemKey: 'THEME_CYBERPUNK',
    name: 'Cyberpunk Neon Theme',
    category: 'THEME',
    price: 0,
    description: 'High-tech neon cyan and violet HUD with holographic scanlines and cyber synth audio.',
    icon: 'Terminal',
  },
  {
    itemKey: 'THEME_LOFI',
    name: 'Cozy Lo-Fi Sanctuary Theme',
    category: 'THEME',
    price: 150,
    description: 'Warm amber tones, rain-streaked glass, floating embers, and gentle acoustic chimes.',
    icon: 'Coffee',
  },
  {
    itemKey: 'THEME_RETRO_DUNGEON',
    name: '16-Bit Retro Dungeon Theme',
    category: 'THEME',
    price: 250,
    description: 'Midnight obsidian stone, gilded runes, pixel badges, and 8-bit chiptune soundscapes.',
    icon: 'Shield',
  },

  // CONSUMABLES (SRS 4.4)
  {
    itemKey: 'STREAK_FREEZE',
    name: 'Aegis Streak Freeze',
    category: 'CONSUMABLE',
    price: 75,
    description: 'Shields your active streak from resetting if you miss a single calendar day.',
    icon: 'Snowflake',
  },
  {
    itemKey: 'POTION_MIND_ELIXIR',
    name: 'Mind Surge Elixir',
    category: 'CONSUMABLE',
    price: 120,
    description: 'Instantly awards +75 XP and sharpens mental focus.',
    icon: 'Sparkles',
  },

  // 3D AVATAR GEAR (SRS 4.4 & 3D Assets)
  {
    itemKey: 'GEAR_CYBER_KATANA',
    name: 'Plasma Cyber-Katana',
    category: 'GEAR',
    price: 200,
    description: 'A radiant high-frequency laser blade that attaches directly to your 3D Hero Avatar.',
    icon: 'Sword',
  },
  {
    itemKey: 'GEAR_CHRONO_WINGS',
    name: 'Chrono-Aether Wings',
    category: 'GEAR',
    price: 350,
    description: 'Wings of articulated hard-light energy mounted to your 3D Hero.',
    icon: 'Feather',
  },
  {
    itemKey: 'GEAR_AEGIS_SHIELD',
    name: 'Vanguard Aegis Barrier',
    category: 'GEAR',
    price: 180,
    description: 'A floating polygonal forcefield orb protecting your avatar in the 3D stage.',
    icon: 'ShieldAlert',
  },
  {
    itemKey: 'GEAR_RUNIC_HALO',
    name: 'Celestial Runic Halo',
    category: 'GEAR',
    price: 300,
    description: 'An orbiting sacred ring of runic light levitating above your 3D Hero.',
    icon: 'Crown',
  },

  // BADGES (SRS 4.4)
  {
    itemKey: 'BADGE_CODE_SORCERER',
    name: 'Title: Code Sorcerer',
    category: 'BADGE',
    price: 100,
    description: 'Honorable digital moniker for masters of the algorithmic arts.',
    icon: 'Wand2',
  },
  {
    itemKey: 'BADGE_IRON_RESOLVE',
    name: 'Title: Iron Resolve',
    category: 'BADGE',
    price: 100,
    description: 'Awarded to champions of relentless discipline and unbroken habits.',
    icon: 'Flame',
  },
] as const;
