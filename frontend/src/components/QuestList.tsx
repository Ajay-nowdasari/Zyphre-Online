'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Coins,
  Brain,
  Dumbbell,
  Heart,
  Users,
  RotateCcw,
  Trash2,
  Plus,
  Flame,
  Award,
} from 'lucide-react';
import { Quest, api } from '../lib/api';
import { sound } from './AudioEngine';

interface QuestListProps {
  quests: Quest[];
  onQuestCompleted: (summary: any) => void;
  onQuestUpdated: () => void;
  onOpenCreateModal: () => void;
}

export const QuestList: React.FC<QuestListProps> = ({
  quests,
  onQuestCompleted,
  onQuestUpdated,
  onOpenCreateModal,
}) => {
  const [tab, setTab] = useState<'ALL' | 'DAILY' | 'WEEKLY' | 'ONE_TIME'>('ALL');
  const [attributeFilter, setAttributeFilter] = useState<string>('ALL');
  const [completingId, setCompletingId] = useState<string | null>(null);

  const filteredQuests = quests.filter((q) => {
    const matchesTab = tab === 'ALL' || q.recurrence === tab;
    const matchesAttr = attributeFilter === 'ALL' || q.targetAttribute === attributeFilter;
    return matchesTab && matchesAttr;
  });

  const pendingQuests = filteredQuests.filter((q) => q.status === 'PENDING');
  const completedQuests = filteredQuests.filter((q) => q.status === 'COMPLETED');

  const handleComplete = async (quest: Quest) => {
    if (completingId) return;
    setCompletingId(quest.id);

    try {
      sound.playQuestComplete();

      // Trigger Confetti explosion
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#00f0ff', '#ff007f', '#facc15', '#10b981'],
      });

      const res = await api.completeQuest(quest.id);

      if (res.rewardSummary?.leveledUp) {
        sound.playLevelUp();
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.4 },
          colors: ['#ffd700', '#00f0ff', '#ffffff'],
        });
      }

      onQuestCompleted(res.rewardSummary);
      onQuestUpdated();
    } catch (err: any) {
      console.error('Failed to complete quest:', err);
      alert(err.message || 'Failed to complete quest');
    } finally {
      setCompletingId(null);
    }
  };

  const handleReset = async (questId: string) => {
    try {
      sound.playBlip();
      await api.resetQuest(questId);
      onQuestUpdated();
    } catch (err) {
      console.error('Failed to reset quest:', err);
    }
  };

  const handleDelete = async (questId: string) => {
    if (!confirm('Are you sure you want to dismiss this quest?')) return;
    try {
      sound.playBlip();
      await api.deleteQuest(questId);
      onQuestUpdated();
    } catch (err) {
      console.error('Failed to delete quest:', err);
    }
  };

  const getAttributeBadge = (attr: string) => {
    switch (attr) {
      case 'INTELLECT':
        return {
          icon: <Brain className="w-3.5 h-3.5 text-cyan-400" />,
          label: 'Intellect',
          border: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
        };
      case 'STRENGTH':
        return {
          icon: <Dumbbell className="w-3.5 h-3.5 text-rose-400" />,
          label: 'Strength',
          border: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
        };
      case 'VITALITY':
        return {
          icon: <Heart className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Vitality',
          border: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        };
      case 'CHARISMA':
        return {
          icon: <Users className="w-3.5 h-3.5 text-purple-400" />,
          label: 'Charisma',
          border: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-yellow-400" />,
          label: attr,
          border: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
        };
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'TRIVIAL':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'EASY':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
      case 'MEDIUM':
        return 'bg-blue-950/60 text-blue-300 border-blue-500/40';
      case 'HARD':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      case 'EPIC':
        return 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-500/50 shadow-[0_0_12px_rgba(217,70,239,0.3)]';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-mono">
            <Award className="w-5 h-5 text-cyan-400" />
            <span>ACTIVE QUEST LOG</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete real-world tasks to synthesize XP, mine Gold, and unlock character evolutions.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playBlip();
            onOpenCreateModal();
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>FORGE NEW QUEST</span>
        </button>
      </div>

      {/* Recurrence Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-white/10 pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
          {[
            { id: 'ALL', label: 'All Log' },
            { id: 'DAILY', label: 'Dailies' },
            { id: 'WEEKLY', label: 'Weeklies' },
            { id: 'ONE_TIME', label: 'Milestones' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sound.playBlip();
                setTab(t.id as any);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === t.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Attribute filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-mono text-slate-500 uppercase mr-1">Stat:</span>
          {['ALL', 'INTELLECT', 'STRENGTH', 'VITALITY', 'CHARISMA'].map((attr) => (
            <button
              key={attr}
              onClick={() => {
                sound.playBlip();
                setAttributeFilter(attr);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                attributeFilter === attr
                  ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-300'
                  : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20'
              }`}
            >
              {attr}
            </button>
          ))}
        </div>
      </div>

      {/* Pending Quests */}
      <div className="space-y-3">
        {pendingQuests.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl glass-panel border border-dashed border-white/10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white font-mono">No Active Quests in this sector</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Your log is clear! Initialize a new challenge to continue leveling up your character.
            </p>
            <button
              onClick={() => {
                sound.playBlip();
                onOpenCreateModal();
              }}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            >
              + Forge New Quest
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {pendingQuests.map((quest) => {
              const attrBadge = getAttributeBadge(quest.targetAttribute);
              const isCompleting = completingId === quest.id;

              return (
                <motion.div
                  key={quest.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group relative p-4 rounded-xl glass-panel border border-white/10 hover:border-cyan-500/40 hover:glow-cyan transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Completion Checkbox Button */}
                    <button
                      onClick={() => handleComplete(quest)}
                      disabled={isCompleting}
                      aria-label={`Complete quest: ${quest.title}`}
                      className="mt-0.5 p-1 rounded-lg text-slate-500 hover:text-cyan-400 active:scale-90 transition-all"
                    >
                      {isCompleting ? (
                        <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                      ) : (
                        <Circle className="w-6 h-6 transition-transform group-hover:scale-110" />
                      )}
                    </button>

                    {/* Quest Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getDifficultyBadge(
                            quest.difficulty
                          )}`}
                        >
                          {quest.difficulty}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${attrBadge.border}`}
                        >
                          {attrBadge.icon}
                          <span>{attrBadge.label}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-black/30 px-2 py-0.5 rounded border border-white/5">
                          <Clock className="w-3 h-3" />
                          <span>{quest.recurrence}</span>
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {quest.title}
                      </h4>

                      {quest.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {quest.description}
                        </p>
                      )}
                    </div>

                    {/* Rewards & Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>+{quest.rewardXp} XP</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>+{quest.rewardGold} G</span>
                        </span>
                      </div>

                      <button
                        onClick={() => handleDelete(quest.id)}
                        aria-label="Delete quest"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-all"
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

      {/* Completed Quests Ledger */}
      {completedQuests.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ACCOMPLISHED QUESTS ({completedQuests.length})</span>
            </h3>
          </div>

          <div className="space-y-2 opacity-75">
            {completedQuests.map((quest) => (
              <div
                key={quest.id}
                className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h5 className="text-xs font-medium text-slate-300 line-through">
                      {quest.title}
                    </h5>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Completed: +{quest.rewardXp} XP • +{quest.rewardGold} Gold
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleReset(quest.id)}
                  title="Reset quest to pending"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/20 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
