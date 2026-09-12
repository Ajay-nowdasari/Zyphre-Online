'use client';

import React from 'react';
import {
  Shield,
  Coins,
  Flame,
  Volume2,
  VolumeX,
  History,
  LogOut,
  Scroll,
  Swords,
  TrendingUp,
  Castle,
  BookOpen,
  Sparkles,
  Snowflake,
  User as UserIcon,
} from 'lucide-react';
import { User } from '../lib/api';
import { sound } from './AudioEngine';

interface GameHUDProps {
  user: User | null;
  activeTab: 'TRIALS' | 'COLOSSEUM' | 'SANCTUM' | 'ARMORY' | 'CHRONICLE';
  onTabChange: (tab: 'TRIALS' | 'COLOSSEUM' | 'SANCTUM' | 'ARMORY' | 'CHRONICLE') => void;
  onOpenAudit: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  xpRequired: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  user,
  activeTab,
  onTabChange,
  onOpenAudit,
  onOpenAuth,
  onLogout,
  isMuted,
  onToggleMute,
  xpRequired,
}) => {
  const level = user?.level || 1;
  const currentXp = user?.currentXp || 0;
  const xpPct = Math.min(100, Math.round((currentXp / xpRequired) * 100));
  const streak = user?.streakCount || 0;
  const streakMultiplier = (1.0 + Math.min(Math.max(0, streak - 1) * 0.05, 0.5)).toFixed(2);

  return (
    <header className="sticky top-0 z-40 border-b border-amber-500/30 bg-black/85 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex flex-col gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      {/* Top Banner Row */}
      <div className="flex items-center justify-between">
        {/* Left: Champion Crest & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-0.5 shadow-[0_0_18px_rgba(245,158,11,0.5)]">
              <div className="w-full h-full bg-[#0d101a] rounded-[14px] flex items-center justify-center text-amber-400 font-serif font-black text-sm">
                L{level}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-serif font-bold text-[9px]">
              LVL
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wider text-[#fffbeb] font-display flex items-center gap-1.5">
                <span>ELDEN REALM</span>
                <span className="text-amber-400 text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 font-mono">
                  RPG CLIENT
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-amber-300/90 font-serif">
              {user ? `${user.username} • ${user.characterTitle || 'Knight of the Sunlit Oath'}` : 'Wandering Initiate'}
            </p>
          </div>
        </div>

        {/* Center Willpower & Soul XP Bar */}
        {user && (
          <div className="hidden md:flex flex-col items-center w-72 lg:w-96">
            <div className="flex items-center justify-between w-full text-[11px] font-serif mb-1">
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>SOUL ESSENCE (XP)</span>
              </span>
              <span className="text-amber-100/90 font-mono">
                {currentXp} / {xpRequired} ({xpPct}%)
              </span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-[#090b12] border border-amber-500/40 overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)] transition-all duration-500"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Right Tools & Treasury */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {user && (
            <>
              {/* Gold Sovereigns */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]" title="Gold Sovereigns">
                <Coins className="w-4 h-4 text-amber-300" />
                <span>{user.currentGold} G</span>
              </div>

              {/* Bonfire Flame of Resolve (Streak) */}
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold"
                title={`${streak} Days Sacred Bonfire • ${streakMultiplier}x Soul Essence Multiplier`}
              >
                <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>{streak}D ({streakMultiplier}x)</span>
              </div>

              {/* Gargoyle Stasis Wards (Freezes) */}
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/40 text-sky-300 font-mono text-xs font-bold"
                title={`${user.streakFreezeCount} Gargoyle Stasis Wards shielding your sacred fire`}
              >
                <Snowflake className="w-4 h-4 text-sky-400" />
                <span>{user.streakFreezeCount}</span>
              </div>
            </>
          )}

          {/* Master Audio Rune */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
            title={isMuted ? 'Unmute procedural sound synthesizer' : 'Mute sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Cryptographic Audit Ledger */}
          <button
            onClick={() => {
              sound.playBlip();
              onOpenAudit();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
            title="Ascendant Grimoire Audit Ledger & Anti-Cheat Proofs"
          >
            <History className="w-4 h-4 text-amber-400/80" />
          </button>

          {user ? (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 transition-all"
              title="Rest at Campfire (Log Out)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playBlip();
                onOpenAuth();
              }}
              className="rpg-button px-4 py-1.5 rounded-xl text-xs font-display font-bold"
            >
              SUMMON CHAMPION
            </button>
          )}
        </div>
      </div>

      {/* Central RPG Hotbar Row */}
      <nav className="flex items-center justify-center overflow-x-auto pt-1">
        <div className="inline-flex p-1 rounded-2xl bg-black/60 border border-amber-500/30 gap-1 sm:gap-2 shadow-2xl">
          {[
            { id: 'TRIALS', label: 'Trials of Valor', icon: Scroll },
            { id: 'COLOSSEUM', label: 'Boss Colosseum', icon: Swords },
            { id: 'SANCTUM', label: 'Champion Sanctum', icon: TrendingUp },
            { id: 'ARMORY', label: 'Relic Armory', icon: Castle },
            { id: 'CHRONICLE', label: 'The Great Chronicle', icon: BookOpen },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playBlip();
                  onTabChange(item.id as any);
                }}
                className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
