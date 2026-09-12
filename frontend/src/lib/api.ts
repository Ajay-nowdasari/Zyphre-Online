const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export interface User {
  id: string;
  email: string;
  username: string;
  level: number;
  currentXp: number;
  currentGold: number;
  lifetimeGold: number;
  streakCount: number;
  streakFreezeCount: number;
  unspentStatPoints: number;
  activeTheme: 'CYBERPUNK' | 'LOFI' | 'RETRO_DUNGEON';
  characterClass?: string;
  characterTitle?: string;
  currentChapter?: number;
  attributes?: {
    intellect: number;
    strength: number;
    vitality: number;
    charisma: number;
  };
  inventory?: Array<{
    id: string;
    itemKey: string;
    name: string;
    category: string;
    isEquipped: boolean;
  }>;
}

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description?: string;
  difficulty: 'TRIVIAL' | 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
  targetAttribute: 'INTELLECT' | 'STRENGTH' | 'VITALITY' | 'CHARISMA';
  rewardXp: number;
  rewardGold: number;
  status: 'PENDING' | 'COMPLETED' | 'ARCHIVED';
  recurrence: 'ONE_TIME' | 'DAILY' | 'WEEKLY';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

export interface ShopItem {
  itemKey: string;
  name: string;
  category: 'THEME' | 'GEAR' | 'CONSUMABLE' | 'BADGE';
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  description: string;
  icon: string;
  isOwned: boolean;
  isEquipped: boolean;
}

export interface CustomReward {
  id: string;
  userId: string;
  title: string;
  description?: string;
  cost: number;
  icon: string;
  timesRedeemed: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  actionType: string;
  xpDelta?: number;
  goldDelta?: number;
  details?: string;
  createdAt: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Fallback check for localStorage token if cookies are blocked by cross-origin
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('life_rpg_token');
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP Error ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: { email: string; password: string; username: string }) =>
    request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => request<{ user: User }>('/api/auth/me'),

  logout: () =>
    request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    }),

  // Quests
  getQuests: (filters?: { status?: string; recurrence?: string; targetAttribute?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.recurrence) params.append('recurrence', filters.recurrence);
    if (filters?.targetAttribute) params.append('targetAttribute', filters.targetAttribute);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ quests: Quest[] }>(`/api/quests${query}`);
  },

  createQuest: (payload: {
    title: string;
    description?: string;
    difficulty: string;
    targetAttribute: string;
    recurrence?: string;
    dueDate?: string | null;
  }) =>
    request<{ quest: Quest }>('/api/quests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateQuest: (id: string, payload: Partial<Quest>) =>
    request<{ quest: Quest }>(`/api/quests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteQuest: (id: string) =>
    request<{ message: string }>(`/api/quests/${id}`, {
      method: 'DELETE',
    }),

  completeQuest: (id: string) =>
    request<{
      completedQuest: Quest;
      updatedUser: User;
      rewardSummary: {
        xpEarned: number;
        goldEarned: number;
        bonusGoldEarned: number;
        streakMultiplier: number;
        currentStreak: number;
        streakMessage: string;
        streakFreezeUsed: boolean;
        leveledUp: boolean;
        levelsGained: number;
        newLevel: number;
        statPointsAwarded: number;
        xpRequiredForNextLevel: number;
      };
    }>(`/api/quests/${id}/complete`, {
      method: 'POST',
    }),

  resetQuest: (id: string) =>
    request<{ quest: Quest }>(`/api/quests/${id}/reset`, {
      method: 'POST',
    }),

  // Character
  getCharacter: () =>
    request<{
      character: User & {
        xpRequiredForCurrentLevel: number;
        streakMultiplier: number;
      };
    }>('/api/character'),

  allocateStats: (payload: {
    intellect: number;
    strength: number;
    vitality: number;
    charisma: number;
  }) =>
    request<{
      user: User;
      attributes: { intellect: number; strength: number; vitality: number; charisma: number };
    }>('/api/character/allocate-stats', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  equipItem: (itemKey: string, equip?: boolean) =>
    request<{ item: any }>('/api/character/equip', {
      method: 'POST',
      body: JSON.stringify({ itemKey, equip }),
    }),

  setTheme: (theme: string) =>
    request<{ activeTheme: string }>('/api/character/theme', {
      method: 'PUT',
      body: JSON.stringify({ theme }),
    }),

  // Shop
  getShopCatalog: () =>
    request<{
      catalog: ShopItem[];
      userGold: number;
      streakFreezes: number;
    }>('/api/shop/catalog'),

  purchaseShopItem: (itemKey: string) =>
    request<{
      message: string;
      user: User;
      purchasedItem: any;
    }>('/api/shop/purchase', {
      method: 'POST',
      body: JSON.stringify({ itemKey }),
    }),

  // Custom Rewards
  getCustomRewards: () => request<{ rewards: CustomReward[] }>('/api/rewards/custom'),

  createCustomReward: (payload: {
    title: string;
    description?: string;
    cost: number;
    icon?: string;
  }) =>
    request<{ reward: CustomReward }>('/api/rewards/custom', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteCustomReward: (id: string) =>
    request<{ message: string }>(`/api/rewards/custom/${id}`, {
      method: 'DELETE',
    }),

  claimCustomReward: (id: string) =>
    request<{
      message: string;
      reward: CustomReward;
      user: User;
    }>(`/api/rewards/custom/${id}/claim`, {
      method: 'POST',
    }),

  // Audit Logs
  getAuditLogs: () => request<{ logs: AuditLog[] }>('/api/audit'),

  // Roleplay & Story Campaign
  getCharacterClasses: () => request<{ classes: any[] }>('/api/roleplay/classes'),

  selectClass: (characterClass: string) =>
    request<{ user: User; classDef: any }>('/api/roleplay/class', {
      method: 'PUT',
      body: JSON.stringify({ characterClass }),
    }),

  getCampaign: () =>
    request<{
      currentLevel: number;
      characterClass: string;
      characterTitle: string;
      chapters: Array<{
        chapter: number;
        requiredLevel: number;
        title: string;
        prologue: string;
        epilogue: string;
        isUnlocked: boolean;
        isCurrent: boolean;
      }>;
    }>('/api/roleplay/campaign'),

  getBossRaid: () =>
    request<{
      boss: {
        id: string;
        bossName: string;
        bossTitle: string;
        currentHp: number;
        maxHp: number;
        bossLevel: number;
        isDefeated: boolean;
      };
    }>('/api/roleplay/boss'),
};
