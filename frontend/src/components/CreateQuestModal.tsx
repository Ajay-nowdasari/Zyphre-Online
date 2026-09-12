'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Coins, Brain, Dumbbell, Heart, Users, Calendar } from 'lucide-react';
import { api, Quest } from '../lib/api';
import { sound } from './AudioEngine';

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestCreated: (quest: Quest) => void;
}

const DIFFICULTY_MAP: Record<string, { xp: number; gold: number; desc: string; color: string }> = {
  TRIVIAL: { xp: 25, gold: 10, desc: 'Quick 5-minute task (e.g. drink water, take vitamins)', color: 'text-slate-400' },
  EASY: { xp: 50, gold: 20, desc: 'Low effort, 15 minutes (e.g. read 5 pages, stretch)', color: 'text-emerald-400' },
  MEDIUM: { xp: 100, gold: 50, desc: 'Standard task, 30-45 minutes (e.g. gym, deep focus session)', color: 'text-blue-400' },
  HARD: { xp: 200, gold: 100, desc: 'Challenging milestone, 1-2 hours (e.g. complex refactor, long run)', color: 'text-amber-400' },
  EPIC: { xp: 400, gold: 250, desc: 'Major breakthrough, monumental effort (e.g. project launch, exam)', color: 'text-fuchsia-400' },
};

export const CreateQuestModal: React.FC<CreateQuestModalProps> = ({
  isOpen,
  onClose,
  onQuestCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'TRIVIAL' | 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC'>('MEDIUM');
  const [targetAttribute, setTargetAttribute] = useState<'INTELLECT' | 'STRENGTH' | 'VITALITY' | 'CHARISMA'>('INTELLECT');
  const [recurrence, setRecurrence] = useState<'ONE_TIME' | 'DAILY' | 'WEEKLY'>('DAILY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setError('');
    setIsSubmitting(true);
    sound.playBlip();

    try {
      const res = await api.createQuest({
        title: title.trim(),
        description: description.trim() || undefined,
        difficulty,
        targetAttribute,
        recurrence,
      });

      sound.playCoin();
      onQuestCreated(res.quest);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to create quest');
    } finally {
      setIsSubmitting(false);
    }
  };

  const preview = DIFFICULTY_MAP[difficulty];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forge-quest-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg p-6 glass-panel rounded-2xl border border-cyan-500/30 glow-cyan max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={() => {
              sound.playBlip();
              onClose();
            }}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-5">
            <h2 id="forge-quest-title" className="text-xl font-bold font-mono text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>FORGE NEW QUEST</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Structure a real-world task. Rewards are verified strictly by the server.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 uppercase">
                Quest Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Next.js App Router Architecture"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 uppercase">
                Tactical Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specific victory conditions or notes..."
                className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Target Attribute Selection */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 uppercase">
                Target Attribute (+1 on completion)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'INTELLECT', label: 'Intellect', icon: Brain, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
                  { id: 'STRENGTH', label: 'Strength', icon: Dumbbell, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
                  { id: 'VITALITY', label: 'Vitality', icon: Heart, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
                  { id: 'CHARISMA', label: 'Charisma', icon: Users, color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = targetAttribute === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        sound.playBlip();
                        setTargetAttribute(item.id as any);
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected ? item.color + ' ring-1 ring-white/20' : 'border-white/10 bg-black/30 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Tier Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-medium text-slate-300 uppercase">
                  Difficulty Tier
                </label>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-cyan-400 font-bold">+{preview.xp} XP</span>
                  <span className="text-amber-400 font-bold">+{preview.gold} G</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {(['TRIVIAL', 'EASY', 'MEDIUM', 'HARD', 'EPIC'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      sound.playBlip();
                      setDifficulty(d);
                    }}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-mono font-bold uppercase transition-all ${
                      difficulty === d
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                        : 'bg-black/30 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className={`text-[11px] mt-1.5 ${preview.color}`}>{preview.desc}</p>
            </div>

            {/* Recurrence Rule */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 uppercase">
                Recurrence Rule
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'DAILY', label: 'Daily Habit' },
                  { id: 'WEEKLY', label: 'Weekly Goal' },
                  { id: 'ONE_TIME', label: 'One-Time Epic' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      sound.playBlip();
                      setRecurrence(r.id as any);
                    }}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                      recurrence === r.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full mt-2 py-3 rounded-xl font-bold font-mono text-sm tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'SYNTHESIZING QUEST...' : 'BIND QUEST TO LOG'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
