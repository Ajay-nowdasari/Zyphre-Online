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
  ARCHMAGE_OF_RUNES: {
    key: 'ARCHMAGE_OF_RUNES',
    name: 'Rune Archmage',
    title: 'Scholar of the Grand Arcana',
    lore: 'Channels the primordial currents of arcane logic and deep study. Weaves ancient grimoires and intense mental disciplines into reality-bending power.',
    primaryAttribute: 'INTELLECT',
    perkName: 'Arcane Focus',
    perkDescription: '+15% bonus Soul Essence (XP) on all Intellect & deep knowledge trials.',
    icon: 'Brain',
  },
  VALIANT_PALADIN: {
    key: 'VALIANT_PALADIN',
    name: 'Valiant Paladin',
    title: 'Knight of the Sunlit Oath',
    lore: 'Tempered in the fires of heavy physical labor, iron discipline, and relentless trials of might. Faces every earthly hardship with an unyielding shield.',
    primaryAttribute: 'STRENGTH',
    perkName: 'Crusader Might',
    perkDescription: '+20% bonus Gold Sovereigns mined from all physical training trials.',
    icon: 'Dumbbell',
  },
  TEMPLAR_GUARDIAN: {
    key: 'TEMPLAR_GUARDIAN',
    name: 'Templar Guardian',
    title: 'Warden of the Eternal Flame',
    lore: 'Vested with the vitality of ancient roots and holy regeneration. Masters restorative sleep, fasting, and bodily rejuvenation to shield against burnout.',
    primaryAttribute: 'VITALITY',
    perkName: 'Holy Bastion',
    perkDescription: 'Grants +1 additional maximum Gargoyle Stasis Ward and accelerated vitality restoration.',
    icon: 'Heart',
  },
  ROYAL_HERALD: {
    key: 'ROYAL_HERALD',
    name: 'Royal Herald',
    title: 'Lord of Alliances & Parley',
    lore: 'Commands courtly eloquence, persuasive rhetoric, and diplomatic mastery. Unlocks barred gates and wins loyalty across kingdoms through magnetic charisma.',
    primaryAttribute: 'CHARISMA',
    perkName: 'Royal Decree',
    perkDescription: 'Permanent 15% discount across all merchant catalog wares in the Grand Bazaar.',
    icon: 'Users',
  },
};

export const STORY_CHAPTERS = [
  {
    chapter: 1,
    requiredLevel: 1,
    title: 'The Slumber in the Sunken Ruins',
    prologue:
      'You awaken on cold basalt beneath the crumbling archways of an ancient sanctuary. The fog of inertia and worldly distractions once clouded your spirit, until the sacred Bonfire flared.',
    epilogue:
      'With your first trials inscribed upon the Golden Parchment, you rise as an anointed Initiate of the Realm.',
  },
  {
    chapter: 2,
    requiredLevel: 2,
    title: 'The Trial of the Obsidian Gate',
    prologue:
      'The sirens of idle amusement whisper from the dark chasms. Phantom mirages seek to quench your hearth flame before your discipline can take root.',
    epilogue:
      'Your will held true. Your Torch of Discipline burns unyielding, lighting the path forward through the mountain passes.',
  },
  {
    chapter: 3,
    requiredLevel: 3,
    title: 'The Cloister of Deep Contemplation',
    prologue:
      'High in the cloud-kissed peaks stands the Great Spire of Solitude. Here, vows of uninterrupted study and rigorous training forge masterworks of human craft.',
    epilogue:
      'Your intellect and stamina ascend in divine balance. The title of Knight Adept is engraved upon your signet ring.',
  },
  {
    chapter: 4,
    requiredLevel: 4,
    title: 'The Siege of the Sloth Wyrm',
    prologue:
      'Chronos the Sloth Wyrm coils in the Colosseum depths below. Every delayed chore and abandoned duty nourishes the beast. Only immediate, decisive valor can shatter its scales.',
    epilogue:
      'The wyrm roars and retreats into the abyss. Every real-world victory shatters darkness into golden spoils and sovereign glory.',
  },
  {
    chapter: 5,
    requiredLevel: 5,
    title: 'Coronation of the Grand Sovereign',
    prologue:
      'You ascend the marble dais of the High Citadel. The physical vessel, the enlightened intellect, and the iron habit loop unite into an immortal legend.',
    epilogue:
      'You no longer merely struggle against worldly hesitation — your daily deeds now shape the destiny of the entire Realm.',
  },
];
