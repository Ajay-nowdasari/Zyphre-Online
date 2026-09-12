'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageSquare, Sparkles, Brain, Shield, ChevronRight, Zap } from 'lucide-react';
import { User } from '../lib/api';
import { sound } from './AudioEngine';

interface CompanionFamiliarProps {
  user: User;
  onOpenClassModal: () => void;
  bossName?: string;
  bossHpPercent?: number;
}

export const CompanionFamiliar: React.FC<CompanionFamiliarProps> = ({
  user,
  onOpenClassModal,
  bossName,
  bossHpPercent = 100,
}) => {
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const heroClass = user.characterClass || 'CODE_SORCERER';
  const heroTitle = user.characterTitle || 'Weaver of Silicon & Logic';
  const streak = user.streakCount || 0;

  const dialogues = [
    `"Greetings, ${user.username}. As a ${heroTitle}, your neural resonance is operating at optimal frequencies. The World Boss awaits your strike."`,
    streak > 2
      ? `"Your discipline streak stands at an impressive ${streak} consecutive cycles! The momentum multiplier is active. Seize today's primary quest."`
      : `"Every legendary campaign begins with a single deliberate ritual. Forge your daily quests and ignite your streak."`,
    bossHpPercent < 100
      ? `"${bossName || 'The World Boss'} has sustained heavy damage (${bossHpPercent}% HP remaining)! Complete more quests to deliver the finishing blow!"`
      : `"The chronometer titan looms in the expedition zone. Every task you accomplish in reality deals devastating combat damage in our realm."`,
    `"Tactical advice: Remember that Intellect increases your XP synthesis rate, while Strength mines more Gold per completed trial."`,
  ];

  const handleNextDialogue = () => {
    sound.playBlip();
    setDialogueIndex((prev) => (prev + 1) % dialogues.length);
  };

  return (
    <div className="relative p-4 sm:p-5 rounded-2xl glass-panel border border-cyan-500/30 glow-cyan overflow-hidden">
      {/* Background Hologram Grid */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Familiar Avatar & Speech */}
        <div className="flex items-start sm:items-center gap-3.5">
          {/* Animated AI Familiar Orb */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)] animate-pulse">
              <Bot className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                <span>A.E.G.I.S. // NEURAL FAMILIAR</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                LORE GUIDE
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={dialogueIndex}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.15 }}
                className="text-xs text-slate-200 mt-1 font-sans leading-relaxed max-w-2xl italic"
              >
                {dialogues[dialogueIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Tactical Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={handleNextDialogue}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 flex items-center gap-1 transition-all active:scale-95"
            title="Next briefing"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Consult</span>
          </button>

          <button
            onClick={() => {
              sound.playBlip();
              onOpenClassModal();
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-black bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.4)] flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Switch Class</span>
          </button>
        </div>
      </div>
    </div>
  );
};
