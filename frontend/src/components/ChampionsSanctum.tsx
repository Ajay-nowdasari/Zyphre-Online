'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Dumbbell, Heart, Users, Sparkles, Check, ShieldAlert, Zap, Award } from 'lucide-react';
import { User, api } from '../lib/api';
import { sound } from './AudioEngine';
import { Sanctuary3DStage } from './Sanctuary3DStage';

interface ChampionsSanctumProps {
  user: User;
  onStatsUpdated: (updatedUser: User) => void;
  onOpenClassModal: () => void;
}

export const ChampionsSanctum: React.FC<ChampionsSanctumProps> = ({
  user,
  onStatsUpdated,
  onOpenClassModal,
}) => {
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
      setError(err.message || 'Stat allocation error');
    } finally {
      setIsSaving(false);
    }
  };

  const attrs = user.attributes || { intellect: 10, strength: 10, vitality: 10, charisma: 10 };
  const equippedGear =
    user.inventory
      ?.filter((i) => i.category === 'GEAR' && i.isEquipped)
      ?.map((i) => i.itemKey) || [];

  const arcanaBonus = Math.max(0, ((attrs.intellect + pointsToSpend.intellect) - 10) * 0.5).toFixed(1);
  const mightBonus = Math.max(0, ((attrs.strength + pointsToSpend.strength) - 10) * 0.5).toFixed(1);
  const presenceDiscount = Math.min(25, Math.max(0, ((attrs.charisma + pointsToSpend.charisma) - 10) * 0.5)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#fffbeb] font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>CHAMPION'S SANCTUM // ATTRIBUTE MATRICES</span>
          </h2>
          <p className="text-xs text-amber-200/70 mt-0.5 font-serif">
            Distribute attribute blessings earned from leveling. Invest in Might, Arcana, Fortitude, and Grace to amplify your strike power, XP extraction, and merchant discounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playBlip();
              onOpenClassModal();
            }}
            className="rpg-button px-3.5 py-1.5 rounded-xl font-display text-xs font-bold flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200" />
            <span>{user.characterClass ? user.characterClass.replace('_', ' ') : 'CHOOSE OATH'}</span>
          </button>

          {availablePoints > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              ★ {availablePoints} UNSPENT POINTS
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 font-mono">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: 3D Hero Inspection Stage & Attribute Distribution Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D Hero Inspection Stage */}
        <div className="lg:col-span-5 h-[340px] sm:h-[400px] rpg-panel rounded-3xl relative overflow-hidden border border-amber-500/30">
          <Sanctuary3DStage
            mode="HERO_SANCTUARY"
            equippedGear={equippedGear}
          />
        </div>

        {/* 4 Core RPG Attributes */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              key: 'intellect' as const,
              title: 'ARCANA',
              subtitle: 'Intellect & Focus',
              val: attrs.intellect,
              pending: pointsToSpend.intellect,
              icon: Brain,
              color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
              barColor: 'bg-cyan-400',
              perk: `+${arcanaBonus}% Soul XP Synthesis bonus on all trials`,
            },
            {
              key: 'strength' as const,
              title: 'MIGHT',
              subtitle: 'Strength & Conditioning',
              val: attrs.strength,
              pending: pointsToSpend.strength,
              icon: Dumbbell,
              color: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
              barColor: 'bg-rose-400',
              perk: `+${mightBonus}% Dragon Gold Mined per completion`,
            },
            {
              key: 'vitality' as const,
              title: 'FORTITUDE',
              subtitle: 'Vitality & Somatic Health',
              val: attrs.vitality,
              pending: pointsToSpend.vitality,
              icon: Heart,
              color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
              barColor: 'bg-emerald-400',
              perk: `Strengthens Flame of Resolve resilience buffer`,
            },
            {
              key: 'charisma' as const,
              title: 'PRESENCE',
              subtitle: 'Charisma & Leadership',
              val: attrs.charisma,
              pending: pointsToSpend.charisma,
              icon: Users,
              color: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
              barColor: 'bg-purple-400',
              perk: `${presenceDiscount}% Merchant Armory catalog discount`,
            },
          ].map((item) => {
            const Icon = item.icon;
            const currentTotal = item.val + item.pending;

            return (
              <div
                key={item.key}
                className={`p-4 rounded-2xl rpg-panel border ${item.color} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
                      <Icon className="w-4 h-4" />
                      <div>
                        <span>{item.title}</span>
                        <span className="text-[10px] text-slate-500 block">{item.subtitle}</span>
                      </div>
                    </div>
                    <span className="text-xl font-bold font-mono text-white">
                      {currentTotal}
                      {item.pending > 0 && (
                        <span className="text-xs text-amber-400 font-mono ml-1">
                          (+{item.pending})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden mb-2.5 border border-white/10">
                    <div
                      className={`h-full ${item.barColor} transition-all duration-300`}
                      style={{ width: `${Math.min(100, (currentTotal / 50) * 100)}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                    {item.perk}
                  </p>
                </div>

                {/* Stat Allocation Controls */}
                {availablePoints > 0 && (
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/10">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Points:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjust(item.key, -1)}
                        disabled={item.pending <= 0}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-sm flex items-center justify-center disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-mono text-xs text-amber-300">
                        {item.pending}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjust(item.key, 1)}
                        disabled={remainingPoints <= 0}
                        className="w-7 h-7 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-sm flex items-center justify-center border border-amber-500/30 disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Save allocation bar */}
      {pendingTotal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_25px_rgba(245,158,11,0.3)]"
        >
          <div className="flex items-center gap-2 text-sm font-mono text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Ready to infuse +{pendingTotal} attribute points ({remainingPoints} remaining)</span>
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
              className="rpg-button px-5 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'INFUSING...' : 'CONFIRM ATTRIBUTE INFUSION'}</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
