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
  // REALM AESTHETICS & THEMES
  {
    itemKey: 'THEME_ELDEN_REALM',
    name: 'Elden Realm (Dark Fantasy)',
    category: 'THEME',
    price: 0,
    description: 'Carved basalt stone, burnished dragon gold filigree, warm embers, and orchestral chimes.',
    icon: 'Shield',
  },
  {
    itemKey: 'THEME_CATHEDRAL_ARCANA',
    name: 'Cathedral of Arcana',
    category: 'THEME',
    price: 150,
    description: 'Stained glass radiance, glowing sapphire runes, chanting resonance, and holy incense.',
    icon: 'Crown',
  },
  {
    itemKey: 'THEME_RETRO_DUNGEON',
    name: 'Gothic Crypt & Catacombs',
    category: 'THEME',
    price: 250,
    description: 'Deep torchlit catacombs, iron portcullises, emerald moss, and 16-bit medieval chiptunes.',
    icon: 'Flame',
  },

  // CONSUMABLES & STASIS WARDS
  {
    itemKey: 'STREAK_FREEZE',
    name: 'Gargoyle Stasis Ward',
    category: 'CONSUMABLE',
    price: 75,
    description: 'Freezes time around your Sacred Bonfire, protecting your streak from resetting if a day is missed.',
    icon: 'Snowflake',
  },
  {
    itemKey: 'POTION_MIND_ELIXIR',
    name: 'Elixir of the Astral Mind',
    category: 'CONSUMABLE',
    price: 120,
    description: 'Ancient concoction brewed from luminous nightshade. Instantly grants +75 Soul Essence (XP).',
    icon: 'Sparkles',
  },

  // 3D HERO AVATAR RELICS & ARMOR
  {
    itemKey: 'GEAR_CYBER_KATANA',
    name: 'Sunforged Broadsword',
    category: 'GEAR',
    price: 200,
    description: 'An enchanted flaming blade infused with solar wrath that equips directly onto your 3D Hero Avatar.',
    icon: 'Sword',
  },
  {
    itemKey: 'GEAR_CHRONO_WINGS',
    name: 'Seraphic Angelic Wings',
    category: 'GEAR',
    price: 350,
    description: 'Wings of woven celestial gold feathers levitating from your 3D Hero in the Sanctuary dais.',
    icon: 'Feather',
  },
  {
    itemKey: 'GEAR_AEGIS_SHIELD',
    name: 'Aegis Kite Shield of Valor',
    category: 'GEAR',
    price: 180,
    description: 'Heavy heraldic heater shield engraved with holy protection wards that hovers alongside your champion.',
    icon: 'ShieldAlert',
  },
  {
    itemKey: 'GEAR_RUNIC_HALO',
    name: 'Crown of the Sun King',
    category: 'GEAR',
    price: 300,
    description: 'An orbiting sacred diadem of incandescent golden runes hovering above your 3D Hero Avatar.',
    icon: 'Crown',
  },

  // MEDIEVAL TITLES & HONORIFIC BADGES
  {
    itemKey: 'BADGE_CODE_SORCERER',
    name: 'Title: Rune Archmage',
    category: 'BADGE',
    price: 100,
    description: 'Revered title bestowed upon those who master the ancient scrolls of knowledge and intellect.',
    icon: 'Wand2',
  },
  {
    itemKey: 'BADGE_IRON_RESOLVE',
    name: 'Title: Knight Commander',
    category: 'BADGE',
    price: 100,
    description: 'Awarded to champions possessing unbroken discipline and unwavering daily valor.',
    icon: 'Flame',
  },
] as const;
