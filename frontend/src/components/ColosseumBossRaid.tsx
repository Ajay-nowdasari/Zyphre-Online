'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Swords, Flame, Sparkles, Trophy, ShieldAlert, Award, Zap } from 'lucide-react';
import { api, User } from '../lib/api';
import { Sanctuary3DStage } from './Sanctuary3DStage';
import { sound } from './AudioEngine';

interface ColosseumBossRaidProps {
  user: User;
  onBossDefeated?: () => void;
}

export const ColosseumBossRaid: React.FC<ColosseumBossRaidProps> = ({ user, onBossDefeated }) => {
  const [boss, setBoss] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [combatLogs, setCombatLogs] = useState<Array<{ id: string; text: string; damage: number; isCrit: boolean }>>([]);
  const [attackTrigger, setAttackTrigger] = useState(0);
  const [floatingDamage, setFloatingDamage] = useState<{ amount: number; isCrit: boolean } | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState(false);

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

  const triggerManualStrike = () => {
    if (!boss || boss.currentHp <= 0) return;

    sound.playQuestComplete();
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 500);

    // Calculate strike damage based on hero's Might (Strength) and Arcana (Intellect)
    const might = user.attributes?.strength || 10;
    const arcana = user.attributes?.intellect || 10;
    const baseDamage = 80 + Math.floor(might * 4 + arcana * 3);
    const isCrit = Math.random() > 0.6;
    const finalDamage = isCrit ? Math.floor(baseDamage * 1.6) : baseDamage;

    setFloatingDamage({ amount: finalDamage, isCrit });
    setTimeout(() => setFloatingDamage(null), 1200);

    setAttackTrigger((prev) => prev + 1);

    const newHp = Math.max(0, boss.currentHp - finalDamage);
    setBoss((prev: any) => ({ ...prev, currentHp: newHp, isDefeated: newHp === 0 }));

    setCombatLogs((prev) => [
      {
        id: Math.random().toString(),
        text: `Hero unleashes ${user.characterClass ? user.characterClass.replace('_', ' ') : 'Heroic Strike'} for ${finalDamage} damage!`,
        damage: finalDamage,
        isCrit,
      },
      ...prev.slice(0, 5),
    ]);

    if (newHp === 0) {
      sound.playLevelUp();
      if (onBossDefeated) onBossDefeated();
    }
  };

  if (isLoading || !boss) {
    return (
      <div className="p-8 rounded-3xl rpg-panel text-center font-mono text-xs text-amber-400 animate-pulse">
        Scrying spatial coordinates of the Void Behemoth...
      </div>
    );
  }

  const hpPercent = Math.max(0, Math.round((boss.currentHp / boss.maxHp) * 100));

  return (
    <div className={`space-y-6 ${isScreenShaking ? 'screen-shake' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#fffbeb] font-display flex items-center gap-2">
            <Skull className="w-5 h-5 text-rose-500 animate-pulse" />
            <span>DUNGEON COLOSSEUM // {boss.bossName.toUpperCase()}</span>
          </h2>
          <p className="text-xs text-amber-200/70 mt-0.5 font-serif">
            Every real-world bounty vanquished channels a direct smite to this ancient wyrm. Slay the behemoth to claim the 250 Dragon Gold Sovereign Slayer Bounty!
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 font-display text-xs font-bold shadow-[0_0_12px_rgba(225,29,72,0.3)]">
          <Swords className="w-4 h-4 text-rose-400" />
          <span>DUNGEON TIER {boss.bossLevel}</span>
        </div>
      </div>

      {/* Main 3D Battlefield Stage */}
      <div className="rpg-panel-boss rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Floating Combat Damage Indicator */}
        {floatingDamage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-combat-damage">
            <span
              className={`font-mono text-2xl sm:text-3xl font-black px-4 py-1.5 rounded-2xl shadow-2xl border ${
                floatingDamage.isCrit
                  ? 'bg-amber-500 text-black border-yellow-300 shadow-[0_0_25px_rgba(245,158,11,0.8)]'
                  : 'bg-rose-600 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.8)]'
              }`}
            >
              -{floatingDamage.amount} {floatingDamage.isCrit ? 'CRITICAL SMITE!' : 'DAMAGE!'}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* 3D Boss Colosseum Stage */}
          <div className="lg:col-span-7 h-[360px] sm:h-[420px] relative rounded-2xl overflow-hidden bg-black/40 border border-rose-500/20">
            <Sanctuary3DStage
              mode="BOSS_COLOSSEUM"
              equippedGear={[]}
              bossHpPercent={hpPercent}
              bossName={boss.bossName}
              attackTrigger={attackTrigger}
            />
          </div>

          {/* Boss Stats, HP Gauge & Strike Command */}
          <div className="lg:col-span-5 space-y-5">
            {/* Boss Name Banner */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                {boss.bossTitle}
              </span>
              <h3 className="text-2xl font-black font-mono text-white mt-0.5">
                {boss.bossName}
              </h3>
            </div>

            {/* Boss HP Gauge */}
            <div className="p-4 rounded-2xl bg-black/60 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
                  <span>TITAN VITALITY MATRIX</span>
                </span>
                <span className="text-white font-bold">
                  {boss.currentHp} / {boss.maxHp} HP ({hpPercent}%)
                </span>
              </div>

              <div className="w-full h-4 bg-black/80 rounded-full overflow-hidden p-0.5 border border-rose-500/40">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.8)]"
                  initial={{ width: '100%' }}
                  animate={{ width: `${hpPercent}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <p className="text-[10px] text-slate-400 font-mono">
                Combat Strike Formula: ⌊XP_earned × (1 + Might / 25)⌋.
              </p>
            </div>

            {/* Attack Button */}
            <button
              onClick={triggerManualStrike}
              disabled={boss.currentHp <= 0}
              className="w-full py-3.5 rounded-2xl font-mono text-sm font-black tracking-wider bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 hover:from-rose-500 hover:to-amber-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] border border-rose-400 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
            >
              <Swords className="w-5 h-5 text-amber-200" />
              <span>CHANNEL HEROIC STRIKE</span>
            </button>

            {/* Recent Combat Log */}
            <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                Live Combat Ledger:
              </span>
              {combatLogs.length === 0 ? (
                <p className="text-[11px] text-slate-500 font-mono italic">
                  Complete real-world trials or channel heroic strikes to record combat log.
                </p>
              ) : (
                combatLogs.map((log) => (
                  <div key={log.id} className="text-[11px] font-mono flex items-center justify-between text-slate-300">
                    <span>{log.text}</span>
                    <span className={log.isCrit ? 'text-amber-400 font-bold' : 'text-rose-400'}>
                      -{log.damage}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
