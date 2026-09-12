'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Coins, Brain, Dumbbell, Heart, Users, Scroll } from 'lucide-react';
import { api, Quest } from '../lib/api';
import { sound } from './AudioEngine';

interface InscribeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrialInscribed: (quest: Quest) => void;
}

const DIFFICULTY_MAP: Record<string, { xp: number; gold: number; title: string; desc: string; color: string }> = {
  TRIVIAL: { xp: 25, gold: 10, title: 'Novice Trial', desc: 'A swift 5-minute discipline (e.g. drink pure water, quick meditation)', color: 'text-slate-400' },
  EASY: { xp: 50, gold: 20, title: 'Apprentice Trial', desc: '15-minute warmup (e.g. read 10 pages, stretches)', color: 'text-emerald-400' },
  MEDIUM: { xp: 100, gold: 50, title: 'Adept Trial', desc: 'Standard 45-minute focus session (e.g. gym workout, deep coding block)', color: 'text-cyan-400' },
  HARD: { xp: 200, gold: 100, title: 'Master Trial', desc: 'Challenging 2-hour endurance trial (e.g. complex refactor, intense study)', color: 'text-amber-400' },
  EPIC: { xp: 400, gold: 250, title: 'Mythic Expedition', desc: 'Monumental heroic breakthrough (e.g. shipping product, milestone exam)', color: 'text-fuchsia-400' },
};

export const InscribeTrialModal: React.FC<InscribeTrialModalProps> = ({
  isOpen,
  onClose,
  onTrialInscribed,
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
      onTrialInscribed(res.quest);
      onClose();
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to inscribe trial');
    } finally {
      setIsSubmitting(false);
    }
  };

  const preview = DIFFICULTY_MAP[difficulty];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inscribe-trial-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg p-6 sm:p-7 rpg-panel rounded-3xl border border-amber-500/40 glow-gold max-h-[90vh] overflow-y-auto"
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
            <h2 id="inscribe-trial-title" className="text-xl font-bold font-display text-[#fffbeb] flex items-center gap-2">
              <Scroll className="w-5 h-5 text-amber-400" />
              <span>INSCRIBE ROYAL WRIT OF VALOR</span>
            </h2>
            <p className="text-xs text-amber-200/70 mt-1 font-serif">
              Inscribe a real-world undertaking onto the Golden Scroll. Rewards and anti-cheat validations are strictly guarded by the realm's server.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-amber-300 mb-1.5 uppercase">
                Trial Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Three.js Shader Architecture & Render Loop"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-amber-300 mb-1.5 uppercase">
                Victory Conditions (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specific tactical requirements for victory..."
                className="w-full px-4 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Target Attribute Selection */}
            <div>
              <label className="block text-xs font-mono font-bold text-amber-300 mb-1.5 uppercase">
                Target Stat Affinity (+1 on victory)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'INTELLECT', label: 'ARCANA', sub: 'Mind & Focus', icon: Brain, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30' },
                  { id: 'STRENGTH', label: 'MIGHT', sub: 'Discipline', icon: Dumbbell, color: 'text-rose-400 border-rose-500/40 bg-rose-950/30' },
                  { id: 'VITALITY', label: 'FORTITUDE', sub: 'Health', icon: Heart, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' },
                  { id: 'CHARISMA', label: 'PRESENCE', sub: 'Influence', icon: Users, color: 'text-purple-400 border-purple-500/40 bg-purple-950/30' },
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
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-mono transition-all ${
                        isSelected ? item.color + ' ring-1 ring-white/30 font-bold' : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span>{item.label}</span>
                      <span className="text-[9px] opacity-75">{item.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Tier Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-bold text-amber-300 uppercase">
                  Trial Difficulty
                </label>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-cyan-300 font-bold">+{preview.xp} SOUL XP</span>
                  <span className="text-amber-300 font-bold">+{preview.gold} GOLD</span>
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
                        ? 'bg-amber-500/30 text-amber-200 border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'bg-black/40 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d === 'TRIVIAL' ? 'NOVICE' : d === 'EASY' ? 'APPRENTICE' : d === 'MEDIUM' ? 'ADEPT' : d === 'HARD' ? 'MASTER' : 'MYTHIC'}
                  </button>
                ))}
              </div>
              <p className={`text-[11px] mt-1.5 font-mono ${preview.color}`}>{preview.desc}</p>
            </div>

            {/* Recurrence Rule */}
            <div>
              <label className="block text-xs font-mono font-bold text-amber-300 mb-1.5 uppercase">
                Campaign Cadence
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'DAILY', label: 'Daily Ritual' },
                  { id: 'WEEKLY', label: 'Grand Campaign' },
                  { id: 'ONE_TIME', label: 'Epoch Milestone' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      sound.playBlip();
                      setRecurrence(r.id as any);
                    }}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      recurrence === r.id
                        ? 'bg-amber-500/25 text-amber-300 border-amber-400'
                        : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
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
              className="rpg-button w-full mt-2 py-3.5 rounded-xl font-bold font-mono text-sm tracking-wide disabled:opacity-40"
            >
              {isSubmitting ? 'BINDING TO GRIMOIRE...' : 'INSCRIBE TRIAL OF VALOR'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
