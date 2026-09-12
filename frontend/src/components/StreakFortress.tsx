'use client';

import React from 'react';
import { Flame, Shield, Snowflake, Zap, Info } from 'lucide-react';
import { User } from '../lib/api';

interface StreakFortressProps {
  user: User;
  onOpenShop: () => void;
}

export const StreakFortress: React.FC<StreakFortressProps> = ({ user, onOpenShop }) => {
  const streak = user.streakCount || 0;
  const streakMultiplier = (1.0 + Math.min(Math.max(0, streak - 1) * 0.05, 0.5)).toFixed(2);
  const freezes = user.streakFreezeCount || 0;

  // Generate a mock 30-day activity matrix for visualization
  const days = Array.from({ length: 30 }, (_, i) => {
    const isRecent = i >= 30 - streak;
    return {
      day: i + 1,
      active: isRecent,
      intensity: isRecent ? Math.min(4, Math.floor(Math.random() * 2) + 2) : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
          <span>STREAK FORTRESS & SHIELDS</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Consecutive daily completions amplify all earned XP and Gold rewards by up to +50%.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Streak */}
        <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 glow-amber flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Active Streak
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-white">
                {streak}
              </span>
              <span className="text-sm font-mono text-amber-300">DAYS</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {streak > 0 ? 'Unbroken discipline active!' : 'Complete today\'s first quest to spark.'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Flame className="w-7 h-7" />
          </div>
        </div>

        {/* Current Multiplier */}
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 glow-cyan flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Reward Multiplier
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-white">
                {streakMultiplier}x
              </span>
              <span className="text-sm font-mono text-cyan-300">BOOST</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Applied automatically to all server-calculated XP & Gold.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Zap className="w-7 h-7" />
          </div>
        </div>

        {/* Streak Freezes */}
        <div className="p-5 rounded-2xl glass-panel border border-sky-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              Aegis Streak Freezes
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-white">
                {freezes}
              </span>
              <span className="text-sm font-mono text-sky-300">SHIELDS</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {freezes > 0
                ? 'Protected from 1 missed calendar day.'
                : 'Vulnerable! Acquire freezes in the shop.'}
            </p>
          </div>
          <button
            onClick={onOpenShop}
            title="Acquire more in shop"
            className="w-12 h-12 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 flex items-center justify-center text-sky-400 transition-all active:scale-95 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
          >
            <Snowflake className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* 30-Day Activity Heat Matrix */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>30-DAY CHRONO MATRIX</span>
          </span>
          <span className="text-xs font-mono text-slate-500">
            Last 30 Calendar Intervals
          </span>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-1.5">
          {days.map((d) => (
            <div
              key={d.day}
              title={`Day ${d.day}: ${d.active ? 'Quests Completed' : 'Rest / Idle'}`}
              className={`h-8 rounded-lg border transition-all ${
                d.active
                  ? 'bg-amber-500/30 border-amber-400/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                  : 'bg-black/30 border-white/5'
              } flex items-center justify-center`}
            >
              <span className="text-[9px] font-mono text-slate-400">{d.day}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 mt-4 pt-4 border-t border-white/5">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            The progression engine automatically evaluates your calendar date difference upon each completed quest. If you miss a day with an Aegis Freeze, it is consumed automatically to protect your streak.
          </span>
        </div>
      </div>
    </div>
  );
};
