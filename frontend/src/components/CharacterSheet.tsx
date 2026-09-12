'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Dumbbell, Heart, Users, Sparkles, Check, ShieldAlert } from 'lucide-react';
import { User, api } from '../lib/api';
import { sound } from './AudioEngine';

interface CharacterSheetProps {
  user: User;
  onStatsUpdated: (updatedUser: User) => void;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ user, onStatsUpdated }) => {
  const [pointsToSpend, setPointsToSpend] = useState<{
    intellect: number;
    strength: number;
    vitality: number;
    charisma: number;
  }>({
    intellect: 0,
    strength: 0,
    vitality: 0,
    charisma: 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const availablePoints = user.unspentStatPoints;
  const pendingTotal =
    pointsToSpend.intellect +
    pointsToSpend.strength +
    pointsToSpend.vitality +
    pointsToSpend.charisma;
  const remainingPoints = availablePoints - pendingTotal;

  const handleAdjust = (attr: keyof typeof pointsToSpend, delta: number) => {
    if (delta > 0 && remainingPoints <= 0) return;
    if (delta < 0 && pointsToSpend[attr] <= 0) return;

    sound.playBlip();
    setPointsToSpend((prev) => ({
      ...prev,
      [attr]: prev[attr] + delta,
    }));
  };

  const handleCommit = async () => {
    if (pendingTotal === 0) return;
    setIsSaving(true);
    setError('');

    try {
      sound.playLevelUp();
      const res = await api.allocateStats(pointsToSpend);
      onStatsUpdated(res.user);
      setPointsToSpend({ intellect: 0, strength: 0, vitality: 0, charisma: 0 });
    } catch (err: any) {
      setError(err.message || 'Failed to allocate attribute points');
    } finally {
      setIsSaving(false);
    }
  };

  const attrs = user.attributes || { intellect: 10, strength: 10, vitality: 10, charisma: 10 };

  // Calculate passive perks
  const intellectBonusPct = Math.max(0, ((attrs.intellect + pointsToSpend.intellect) - 10) * 0.5).toFixed(1);
  const strengthBonusPct = Math.max(0, ((attrs.strength + pointsToSpend.strength) - 10) * 0.5).toFixed(1);
  const charismaDiscountPct = Math.min(25, Math.max(0, ((attrs.charisma + pointsToSpend.charisma) - 10) * 0.5)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>CHARACTER ATTRIBUTES & RADAR</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Leveling up grants +5 stat points. Distribute them to unlock powerful passive perks.
          </p>
        </div>

        {availablePoints > 0 && (
          <div className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold animate-pulse">
            ★ {availablePoints} UNSPENT POINTS
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Attributes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            key: 'intellect' as const,
            title: 'INTELLECT',
            val: attrs.intellect,
            pending: pointsToSpend.intellect,
            icon: Brain,
            color: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
            barColor: 'bg-cyan-400',
            perk: `+${intellectBonusPct}% XP Boost on all quests`,
          },
          {
            key: 'strength' as const,
            title: 'STRENGTH',
            val: attrs.strength,
            pending: pointsToSpend.strength,
            icon: Dumbbell,
            color: 'border-rose-500/30 bg-rose-500/5 text-rose-400',
            barColor: 'bg-rose-400',
            perk: `+${strengthBonusPct}% Gold Mined per completion`,
          },
          {
            key: 'vitality' as const,
            title: 'VITALITY',
            val: attrs.vitality,
            pending: pointsToSpend.vitality,
            icon: Heart,
            color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
            barColor: 'bg-emerald-400',
            perk: `Fortifies Streak resilience & recovery`,
          },
          {
            key: 'charisma' as const,
            title: 'CHARISMA',
            val: attrs.charisma,
            pending: pointsToSpend.charisma,
            icon: Users,
            color: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
            barColor: 'bg-purple-400',
            perk: `${charismaDiscountPct}% Merchant shop price discount`,
          },
        ].map((item) => {
          const Icon = item.icon;
          const currentTotal = item.val + item.pending;

          return (
            <motion.div
              key={item.key}
              whileHover={{ y: -2 }}
              className={`p-4 rounded-2xl glass-panel border ${item.color} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
                    <Icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </div>
                  <span className="text-xl font-bold font-mono text-white">
                    {currentTotal}
                    {item.pending > 0 && (
                      <span className="text-xs text-emerald-400 font-mono ml-1">
                        (+{item.pending})
                      </span>
                    )}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden mb-3">
                  <div
                    className={`h-full ${item.barColor} transition-all duration-300`}
                    style={{ width: `${Math.min(100, (currentTotal / 50) * 100)}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                  {item.perk}
                </p>
              </div>

              {/* Allocation buttons if unspent points exist */}
              {availablePoints > 0 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Allocate:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjust(item.key, -1)}
                      disabled={item.pending <= 0}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-sm flex items-center justify-center disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-mono text-xs text-cyan-300">
                      {item.pending}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjust(item.key, 1)}
                      disabled={remainingPoints <= 0}
                      className="w-7 h-7 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-sm flex items-center justify-center border border-cyan-500/30 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Save allocation bar */}
      {pendingTotal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-cyan-950/70 border border-cyan-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_25px_rgba(0,240,255,0.25)]"
        >
          <div className="flex items-center gap-2 text-sm font-mono text-cyan-200">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>Ready to commit +{pendingTotal} attribute points ({remainingPoints} remaining)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPointsToSpend({ intellect: 0, strength: 0, vitality: 0, charisma: 0 })}
              className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
            >
              Reset
            </button>
            <button
              onClick={handleCommit}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold font-mono bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_15px_rgba(0,240,255,0.5)] flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'UPDATING...' : 'CONFIRM STAT ALLOCATION'}</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
