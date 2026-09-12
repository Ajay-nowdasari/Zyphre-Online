'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Coins,
  Flame,
  Volume2,
  VolumeX,
  User as UserIcon,
  LogOut,
  Sparkles,
  ShoppingBag,
  ListTodo,
  TrendingUp,
  History,
  Palette,
  Terminal,
} from 'lucide-react';
import { api, User, Quest } from '../lib/api';
import { useTheme, AppTheme } from '../components/ThemeContext';
import { sound } from '../components/AudioEngine';
import { Hero3DCanvas } from '../components/Hero3DCanvas';
import { QuestCore3D } from '../components/QuestCore3D';
import { QuestList } from '../components/QuestList';
import { CreateQuestModal } from '../components/CreateQuestModal';
import { CharacterSheet } from '../components/CharacterSheet';
import { StreakFortress } from '../components/StreakFortress';
import { VirtualShop } from '../components/VirtualShop';
import { AuthModal } from '../components/AuthModal';
import { AuditHistoryModal } from '../components/AuditHistoryModal';

export default function Home() {
  const { theme, changeTheme, isMuted, toggleAudioMute } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [characterDetails, setCharacterDetails] = useState<any>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeTab, setActiveTab] = useState<'QUESTS' | 'CHARACTER' | 'STREAK' | 'SHOP'>('QUESTS');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateQuestOpen, setIsCreateQuestOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // 3D FX triggers
  const [coreBurstTrigger, setCoreBurstTrigger] = useState(0);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  // Initial load
  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    try {
      // Check current session
      const meRes = await api.me();
      if (meRes.user) {
        setUser(meRes.user);
        if (meRes.user.activeTheme) {
          changeTheme(meRes.user.activeTheme as AppTheme);
        }
        await loadUserData();
      }
    } catch (err) {
      // Unauthenticated: show demo or prompt
      setIsAuthOpen(true);
    }
  };

  const loadUserData = async () => {
    try {
      const [charRes, questRes] = await Promise.all([
        api.getCharacter(),
        api.getQuests(),
      ]);
      setCharacterDetails(charRes.character);
      setUser(charRes.character);
      setQuests(questRes.quests);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const handleQuestCompleted = (summary: any) => {
    setCoreBurstTrigger((prev) => prev + 1);
    if (summary.leveledUp) {
      setIsLevelingUp(true);
      setTimeout(() => setIsLevelingUp(false), 3000);
    }
    loadUserData();
  };

  const handleLogout = async () => {
    sound.playBlip();
    await api.logout().catch(() => {});
    localStorage.removeItem('life_rpg_token');
    setUser(null);
    setCharacterDetails(null);
    setIsAuthOpen(true);
  };

  // Equipped 3D Gear array
  const equippedGear =
    user?.inventory
      ?.filter((item) => item.category === 'GEAR' && item.isEquipped)
      ?.map((item) => item.itemKey) || [];

  const level = user?.level || 1;
  const currentXp = user?.currentXp || 0;
  const requiredXp = characterDetails?.xpRequiredForCurrentLevel || 100;
  const xpPercent = Math.min(100, Math.round((currentXp / requiredXp) * 100));

  return (
    <main className="min-h-screen relative flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Background Ambience Layer */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-black" />

      {/* TOP HUD BAR */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wider text-white font-mono">
                LIFE<span className="text-cyan-400">RPG</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                v1.0 • AAA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Gamified Productivity Protocol
            </p>
          </div>
        </div>

        {/* Center Live Stats */}
        {user && (
          <div className="hidden lg:flex items-center gap-6">
            {/* Level & XP */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                L{level}
              </div>
              <div className="w-32">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>EXP</span>
                  <span>
                    {currentXp} / {requiredXp}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Gold */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
              <Coins className="w-4 h-4" />
              <span>{user.currentGold} G</span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold">
              <Flame className="w-4 h-4" />
              <span>{user.streakCount}D STREAK</span>
            </div>
          </div>
        )}

        {/* Right Tools & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle */}
          <button
            onClick={toggleAudioMute}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all"
            title={isMuted ? 'Unmute procedural sound FX' : 'Mute sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Audit Ledger */}
          <button
            onClick={() => {
              sound.playBlip();
              setIsAuditOpen(true);
            }}
            aria-label="View audit ledger"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all"
            title="ACID Verification & Audit Log"
          >
            <History className="w-4 h-4" />
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <span className="text-xs font-mono text-cyan-300 hidden sm:inline-block">
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playBlip();
                setIsAuthOpen(true);
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
            >
              AUTHENTICATE
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* HERO 3D STAGE & XP COCKPIT */}
        <section className="relative rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left: Interactive 3D WebGL Avatar */}
            <div className="lg:col-span-7 h-[360px] sm:h-[420px] relative">
              <Hero3DCanvas
                level={level}
                equippedGear={equippedGear}
                isLevelingUp={isLevelingUp}
              />
            </div>

            {/* Right: Progression HUD & 3D Crystal */}
            <div className="lg:col-span-5 p-6 sm:p-8 space-y-5 border-t lg:border-t-0 lg:border-l border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                    HERO CLASS: PROTOCOL SPECIALIST
                  </span>
                  <h2 className="text-2xl font-extrabold text-white font-mono mt-0.5">
                    {user?.username || 'GUEST AVATAR'}
                  </h2>
                </div>
                <div className="w-16 h-16 shrink-0">
                  <QuestCore3D burstTrigger={coreBurstTrigger} />
                </div>
              </div>

              {/* XP Gauge */}
              <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>LEVEL {level} PROGRESSION</span>
                  </span>
                  <span className="text-slate-300">
                    {currentXp} / {requiredXp} XP ({xpPercent}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 rounded-full shadow-[0_0_12px_rgba(0,240,255,0.6)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Formula: XP_req(L) = ⌊100 × L^{1.5}⌋. Upon level up: +5 stat points & bonus gold.
                </p>
              </div>

              {/* Quick Stat Tiles */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Wallet</span>
                  <span className="text-base font-bold font-mono text-amber-400">{user?.currentGold || 0} G</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Streak</span>
                  <span className="text-base font-bold font-mono text-rose-400">{user?.streakCount || 0} D</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Freezes</span>
                  <span className="text-base font-bold font-mono text-sky-400">{user?.streakFreezeCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRIMARY NAVIGATION TABS */}
        <nav aria-label="Game Sections" className="flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-2xl glass-panel border border-white/10 gap-1 sm:gap-2 shadow-xl">
            {[
              { id: 'QUESTS', label: 'Quests Log', icon: ListTodo },
              { id: 'CHARACTER', label: 'Character Radar', icon: TrendingUp },
              { id: 'STREAK', label: 'Streak Fortress', icon: Flame },
              { id: 'SHOP', label: 'Virtual Bazaar', icon: ShoppingBag },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playBlip();
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ACTIVE SECTION CONTENT */}
        <section className="min-h-[400px]">
          {activeTab === 'QUESTS' && (
            <QuestList
              quests={quests}
              onQuestCompleted={handleQuestCompleted}
              onQuestUpdated={loadUserData}
              onOpenCreateModal={() => setIsCreateQuestOpen(true)}
            />
          )}

          {activeTab === 'CHARACTER' && user && (
            <CharacterSheet
              user={user}
              onStatsUpdated={(updated) => {
                setUser(updated);
                loadUserData();
              }}
            />
          )}

          {activeTab === 'STREAK' && user && (
            <StreakFortress
              user={user}
              onOpenShop={() => setActiveTab('SHOP')}
            />
          )}

          {activeTab === 'SHOP' && user && (
            <VirtualShop
              user={user}
              onUserUpdated={(updated) => {
                setUser(updated);
                loadUserData();
              }}
              onThemeChanged={(newTheme) => {
                // Theme changed
              }}
            />
          )}
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-6 px-4 text-center text-xs font-mono text-slate-500">
        <p>
          LIFE RPG — Gamified Real-World Productivity Platform • Built with Next.js, Express, Three.js & Prisma
        </p>
      </footer>

      {/* MODALS */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(authedUser) => {
          setUser(authedUser);
          loadUserData();
        }}
      />

      <CreateQuestModal
        isOpen={isCreateQuestOpen}
        onClose={() => setIsCreateQuestOpen(false)}
        onQuestCreated={() => loadUserData()}
      />

      <AuditHistoryModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />
    </main>
  );
}
