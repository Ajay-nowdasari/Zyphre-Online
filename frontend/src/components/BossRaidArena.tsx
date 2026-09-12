'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skull, Swords, Flame, Sparkles, Trophy, ShieldAlert, Award } from 'lucide-react';
import { api, User } from '../lib/api';
import { QuestCore3D } from './QuestCore3D';
import { sound } from './AudioEngine';

interface BossRaidArenaProps {
  user: User;
  onBossDefeated?: () => void;
}

export const BossRaidArena: React.FC<BossRaidArenaProps> = ({ user, onBossDefeated }) => {
  const [boss, setBoss] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBoss();
  }, [user.id]);

  const loadBoss = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBossRaid();
      setBoss(res.boss);
    } catch (err) {
      console.error('Failed to load boss raid:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !boss) {
    return (
      <div className="p-8 rounded-2xl glass-panel text-center font-mono text-xs text-slate-400 animate-pulse">
        Locating spatial coordinates of the World Behemoth...
      </div>
    );
  }

  const hpPercent = Math.max(0, Math.round((boss.currentHp / boss.maxHp) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <Skull className="w-5 h-5 text-rose-500 animate-pulse" />
            <span>EXPEDITION ZONE // WORLD BOSS RAID</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every real-world quest you accomplish in reality deals devastating combat damage to the Behemoth.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold">
          <Swords className="w-4 h-4" />
          <span>RAID LEVEL {boss.bossLevel}</span>
        </div>
      </div>

      {/* Main Boss Battlefield Arena */}
      <div className="relative p-6 sm:p-8 rounded-3xl glass-panel border border-rose-500/30 shadow-[0_0_35px_rgba(244,63,94,0.15)] overflow-hidden">
        {/* Background menacing radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-950/30 via-transparent to-black pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Boss Hologram Core */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
            <div className="w-40 h-40 relative">
              <QuestCore3D activeAttribute="STRENGTH" />
            </div>
            <div className="mt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                {boss.bossTitle}
              </span>
              <h3 className="text-lg font-extrabold font-mono text-white mt-0.5">
                {boss.bossName}
              </h3>
            </div>
          </div>

          {/* Boss Stats & Health Bar */}
          <div className="lg:col-span-8 space-y-5">
            {/* HP Bar */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
                  <span>BEHEMOTH HEALTH MATRIX</span>
                </span>
                <span className="text-slate-300 font-bold">
                  {boss.currentHp} / {boss.maxHp} HP ({hpPercent}%)
                </span>
              </div>

              <div className="w-full h-4 bg-black/80 rounded-full overflow-hidden p-0.5 border border-rose-500/30">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.8)]"
                  initial={{ width: '100%' }}
                  animate={{ width: `${hpPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>

              <p className="text-[11px] text-slate-400 font-mono">
                Combat Formula: Damage = ⌊XP_gained × (1 + TargetAttribute / 25)⌋.
              </p>
            </div>

            {/* Combat Intel Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Combat Role</span>
                <span className="text-sm font-bold font-mono text-cyan-300">
                  {user.characterClass ? user.characterClass.replace('_', ' ') : 'STRIKER'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Slayer Bounty</span>
                <span className="text-sm font-bold font-mono text-amber-400">+250 GOLD</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Raid Status</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {boss.isDefeated ? 'CONQUERED' : 'ENGAGED'}
                </span>
              </div>
            </div>

            {/* Tactical Lore Briefing */}
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-rose-200 font-sans leading-relaxed flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                <strong>Lore Briefing:</strong> {boss.bossName} manifests whenever procrastination and cognitive fatigue build up in the physical vessel. Complete any Pending Quest in your log to channel tactical arcane and kinetic strikes against this behemoth!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
