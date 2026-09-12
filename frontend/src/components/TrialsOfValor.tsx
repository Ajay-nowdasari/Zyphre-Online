'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Scroll,
  Swords,
  Flame,
  Coins,
  Brain,
  Dumbbell,
  Heart,
  Users,
  Plus,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import { Quest, api } from '../lib/api';
import { sound } from './AudioEngine';

interface TrialsOfValorProps {
  quests: Quest[];
  onTrialVanquished: (summary: any) => void;
  onRefreshTrials: () => void;
  onOpenInscribeModal: () => void;
}

export const TrialsOfValor: React.FC<TrialsOfValorProps> = ({
  quests,
  onTrialVanquished,
  onRefreshTrials,
  onOpenInscribeModal,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'DAILY' | 'WEEKLY' | 'ONE_TIME'>('ALL');
  const [attrFilter, setAttrFilter] = useState<string>('ALL');
  const [vanquishingId, setVanquishingId] = useState<string | null>(null);

  const filtered = quests.filter((q) => {
    const matchType = filterType === 'ALL' || q.recurrence === filterType;
    const matchAttr = attrFilter === 'ALL' || q.targetAttribute === attrFilter;
    return matchType && matchAttr;
  });

  const activeTrials = filtered.filter((q) => q.status === 'PENDING');
  const vanquishedTrials = filtered.filter((q) => q.status === 'COMPLETED');

  const handleVanquish = async (quest: Quest) => {
    if (vanquishingId) return;
    setVanquishingId(quest.id);

    try {
      sound.playQuestComplete();

      // Golden Victory Particle Cascade
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#f59e0b', '#00f0ff', '#ffffff'],
      });

      const res = await api.completeQuest(quest.id);

      if (res.rewardSummary?.leveledUp) {
        sound.playLevelUp();
        confetti({
          particleCount: 160,
          spread: 120,
          origin: { y: 0.4 },
          colors: ['#ffd700', '#f59e0b', '#f43f5e'],
        });
      }

      onTrialVanquished(res.rewardSummary);
      onRefreshTrials();
    } catch (err: any) {
      console.error('Failed to vanquish trial:', err);
      alert(err.message || 'Trial completion error');
    } finally {
      setVanquishingId(null);
    }
  };

  const handleResetTrial = async (id: string) => {
    sound.playBlip();
    await api.resetQuest(id);
    onRefreshTrials();
  };

  const handleDismissTrial = async (id: string) => {
    if (!confirm('Dismiss this sacred trial from your Grimoire?')) return;
    sound.playBlip();
    await api.deleteQuest(id);
    onRefreshTrials();
  };

  const getAttributeBadge = (attr: string) => {
    switch (attr) {
      case 'INTELLECT':
        return {
          label: 'ARCANA',
          icon: <Brain className="w-3.5 h-3.5 text-cyan-400" />,
          style: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
        };
      case 'STRENGTH':
        return {
          label: 'MIGHT',
          icon: <Dumbbell className="w-3.5 h-3.5 text-rose-400" />,
          style: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
        };
      case 'VITALITY':
        return {
          label: 'FORTITUDE',
          icon: <Heart className="w-3.5 h-3.5 text-emerald-400" />,
          style: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
        };
      case 'CHARISMA':
        return {
          label: 'PRESENCE',
          icon: <Users className="w-3.5 h-3.5 text-purple-400" />,
          style: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
        };
      default:
        return {
          label: attr,
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
          style: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
        };
    }
  };

  const getDifficultyTitle = (diff: string) => {
    switch (diff) {
      case 'TRIVIAL':
        return { title: 'NOVICE TRIAL', color: 'text-slate-400 border-slate-700 bg-slate-900/60' };
      case 'EASY':
        return { title: 'APPRENTICE TRIAL', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' };
      case 'MEDIUM':
        return { title: 'ADEPT TRIAL', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40' };
      case 'HARD':
        return { title: 'MASTER TRIAL', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' };
      case 'EPIC':
        return { title: 'MYTHIC EXPEDITION', color: 'text-fuchsia-400 border-fuchsia-500/50 bg-fuchsia-950/50 shadow-[0_0_12px_rgba(217,70,239,0.3)]' };
      default:
        return { title: diff, color: 'text-slate-400 border-slate-700 bg-slate-900/60' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Game Inscription Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <Scroll className="w-5 h-5 text-amber-400" />
            <span>TRIALS OF VALOR // SACRED GRIMOIRE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Slay real-world stagnation. Each trial vanquished siphons Soul Essence (XP), mines Dragon Gold, and unleashes strikes upon the World Boss.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playBlip();
            onOpenInscribeModal();
          }}
          className="rpg-button px-5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-amber-200" />
          <span>INSCRIBE NEW TRIAL</span>
        </button>
      </div>

      {/* Recurrence Category Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-black/50 rounded-xl border border-amber-500/30">
          {[
            { id: 'ALL', label: 'All Scrolls' },
            { id: 'DAILY', label: 'Daily Rituals' },
            { id: 'WEEKLY', label: 'Grand Campaigns' },
            { id: 'ONE_TIME', label: 'Epoch Milestones' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playBlip();
                setFilterType(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                filterType === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Attribute Affinities */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-mono text-amber-400 uppercase mr-1">Stat:</span>
          {['ALL', 'INTELLECT', 'STRENGTH', 'VITALITY', 'CHARISMA'].map((attr) => (
            <button
              key={attr}
              onClick={() => {
                sound.playBlip();
                setAttrFilter(attr);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                attrFilter === attr
                  ? 'border-amber-400/60 bg-amber-400/15 text-amber-300 font-bold'
                  : 'border-white/5 bg-black/30 text-slate-400 hover:border-white/20'
              }`}
            >
              {attr === 'INTELLECT'
                ? 'ARCANA'
                : attr === 'STRENGTH'
                ? 'MIGHT'
                : attr === 'VITALITY'
                ? 'FORTITUDE'
                : attr === 'CHARISMA'
                ? 'PRESENCE'
                : 'ALL'}
            </button>
          ))}
        </div>
      </div>

      {/* Active Quest Scrolls */}
      <div className="space-y-3.5">
        {activeTrials.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl rpg-panel border border-dashed border-amber-500/30">
            <Scroll className="w-10 h-10 text-amber-400/60 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white font-mono">No Active Trials in this Sector</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Your Grimoire is currently calm. Inscribe a new heroic ritual to build momentum and power up your Champion.
            </p>
            <button
              onClick={() => {
                sound.playBlip();
                onOpenInscribeModal();
              }}
              className="rpg-button px-4 py-2 rounded-xl text-xs font-mono font-bold"
            >
              + Inscribe Trial of Valor
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activeTrials.map((quest) => {
              const attr = getAttributeBadge(quest.targetAttribute);
              const diff = getDifficultyTitle(quest.difficulty);
              const isVanquishing = vanquishingId === quest.id;

              return (
                <motion.div
                  key={quest.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="group relative p-4 sm:p-5 rounded-2xl rpg-panel border hover:border-amber-500/60 hover:rpg-glow-gold transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Vanquish Action Button */}
                    <button
                      onClick={() => handleVanquish(quest)}
                      disabled={isVanquishing}
                      aria-label={`Vanquish trial: ${quest.title}`}
                      className="mt-0.5 p-1 rounded-xl text-amber-500/60 hover:text-amber-400 active:scale-90 transition-all"
                      title="Vanquish Trial & Strike World Boss!"
                    >
                      {isVanquishing ? (
                        <div className="w-7 h-7 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                      ) : (
                        <Circle className="w-7 h-7 transition-transform group-hover:scale-110" />
                      )}
                    </button>

                    {/* Trial Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded border uppercase font-bold tracking-wider ${diff.color}`}
                        >
                          {diff.title}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${attr.style}`}
                        >
                          {attr.icon}
                          <span>{attr.label}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>{quest.recurrence}</span>
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white group-hover:text-amber-300 font-mono transition-colors">
                        {quest.title}
                      </h4>

                      {quest.description && (
                        <p className="text-xs text-slate-300 mt-1 font-sans leading-relaxed">
                          {quest.description}
                        </p>
                      )}
                    </div>

                    {/* Rewards & Dismiss */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-300 bg-cyan-950/70 px-2.5 py-1 rounded-lg border border-cyan-500/40">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>+{quest.rewardXp} SOUL XP</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-300 bg-amber-950/70 px-2.5 py-1 rounded-lg border border-amber-500/40">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>+{quest.rewardGold} GOLD</span>
                        </span>
                      </div>

                      <button
                        onClick={() => handleDismissTrial(quest.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-all"
                        title="Dismiss trial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Vanquished Trials Archives */}
      {vanquishedTrials.length > 0 && (
        <div className="mt-8 pt-6 border-t border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>VANQUISHED TRIALS ({vanquishedTrials.length})</span>
            </h3>
          </div>

          <div className="space-y-2 opacity-80">
            {vanquishedTrials.map((quest) => (
              <div
                key={quest.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h5 className="text-xs font-medium text-slate-300 line-through font-mono">
                      {quest.title}
                    </h5>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Trial Conquered: +{quest.rewardXp} Soul XP • +{quest.rewardGold} Dragon Gold
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleResetTrial(quest.id)}
                  title="Resummon trial to active log"
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-mono text-amber-400 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resummon</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
