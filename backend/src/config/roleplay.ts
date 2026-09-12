export interface CharacterClassDef {
  key: string;
  name: string;
  title: string;
  lore: string;
  primaryAttribute: 'INTELLECT' | 'STRENGTH' | 'VITALITY' | 'CHARISMA';
  perkName: string;
  perkDescription: string;
  icon: string;
}

export const CHARACTER_CLASSES: Record<string, CharacterClassDef> = {
  CODE_SORCERER: {
    key: 'CODE_SORCERER',
    name: 'Code Sorcerer',
    title: 'Weaver of Silicon & Logic',
    lore: 'Channels the arcane flow of computational logic, turning syntax into digital power and architecture into impenetrable bastions.',
    primaryAttribute: 'INTELLECT',
    perkName: 'Overclock Protocol',
    perkDescription: '+15% bonus XP on all Intellect & mental focus quests.',
    icon: 'Brain',
  },
  KINETIC_VANGUARD: {
    key: 'KINETIC_VANGUARD',
    name: 'Kinetic Vanguard',
    title: 'Champion of Iron Will',
    lore: 'Hardened through relentless biological discipline and physical exertion. Treats every obstacle as resistance to be conquered.',
    primaryAttribute: 'STRENGTH',
    perkName: 'Iron Momentum',
    perkDescription: '+20% bonus Gold mined on all physical conditioning tasks.',
    icon: 'Dumbbell',
  },
  BIO_SENTINEL: {
    key: 'BIO_SENTINEL',
    name: 'Bio-Sentinel',
    title: 'Guardian of Cellular Equilibrium',
    lore: 'Master of somatic restoration, deep sleep, and neurochemical recovery. Protects the mind and vessel from mental fatigue.',
    primaryAttribute: 'VITALITY',
    perkName: 'Cellular Aegis',
    perkDescription: 'Grants +1 additional maximum Streak Freeze capacity and faster resilience recovery.',
    icon: 'Heart',
  },
  CYBER_INFILTRATOR: {
    key: 'CYBER_INFILTRATOR',
    name: 'Cyber Infiltrator',
    title: 'Diplomat of the Neon Grid',
    lore: 'Navigates human networks, leadership alliances, and social engineering. Unlocks closed doors through charisma and influence.',
    primaryAttribute: 'CHARISMA',
    perkName: 'Syndicate Bargain',
    perkDescription: 'Permanent 15% discount across all merchant catalog offerings.',
    icon: 'Users',
  },
};

export const STORY_CHAPTERS = [
  {
    chapter: 1,
    requiredLevel: 1,
    title: 'The Neon Awakening',
    prologue:
      'You awaken in the shadow of the digital spire. The noise of endless micro-distractions threatened to drown your ambition, until the Neural Core sparked to life.',
    epilogue:
      'With your initial quests sealed in blood and code, you step beyond the threshold of hesitation.',
  },
  {
    chapter: 2,
    requiredLevel: 2,
    title: 'Breaking the Chains of Distraction',
    prologue:
      'The sirens of instant gratification call from the digital void. Sirens of dopamine loops that yield no real-world triumph.',
    epilogue:
      'You severed the phantom tether. Your streak stands as an unbroken fortress against the void.',
  },
  {
    chapter: 3,
    requiredLevel: 3,
    title: 'The Sanctuary of Deep Focus',
    prologue:
      'Deep within the citadel lies the Chamber of Single-Tasking. Here, hours distill into monumental breakthroughs.',
    epilogue:
      'Your intellect and stamina harmonize. The title of Adept Vanguard is etched onto your profile.',
  },
  {
    chapter: 4,
    requiredLevel: 4,
    title: 'Conquering the Void of Procrastination',
    prologue:
      'Chronos stirs in the depths. Every delayed task feeds the beast. Only immediate tactical action can strike its core.',
    epilogue:
      'The beast recoils. Real-world tasks materialize into tangible virtual treasures and mastery.',
  },
  {
    chapter: 5,
    requiredLevel: 5,
    title: 'Ascension to Grand Archon',
    prologue:
      'You stand at the pinnacle of self-mastery. The physical vessel, the computational mind, and the unbroken habit loop unite.',
    epilogue:
      'You are no longer merely playing an RPG — your life has become the legendary campaign.',
  },
];
