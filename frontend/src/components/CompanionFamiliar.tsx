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

  const heroClass = user.characterClass || 'VALIANT_PALADIN';
  const heroTitle = user.characterTitle || 'Knight of the Sunlit Oath';
  const streak = user.streakCount || 0;

  const dialogues = [
    `"Greetings, Sir ${user.username}. As a ${heroTitle}, your sacred oath shines radiant across the realm. The Colosseum Wyrm trembles at your approach."`,
    streak > 2
      ? `"Your Sacred Bonfire burns bright at ${streak} unbroken cycles! The momentum blessing amplifies your Soul Essence extraction. Vanquish today's primary writ."`
      : `"Every legendary crusade begins with a single deliberate morning ritual. Inscribe your daily writs and rekindle your campfire."`,
    bossHpPercent < 100
      ? `"${bossName || 'The Sloth Wyrm'} has sustained devastating damage (${bossHpPercent}% HP remaining)! Complete your tasks to strike the final blow!"`
      : `"The wyrm coils in the Colosseum depths. Every task you triumph over in reality channels a piercing golden smite to its dark scales."`,
    `"Royal counsel: Remember that Arcana increases your Soul Essence gain, whilst Might mines greater Dragon Gold Sovereigns from completed bounties."`,
  ];

  const handleNextDialogue = () => {
    sound.playBlip();
    setDialogueIndex((prev) => (prev + 1) % dialogues.length);
  };

  return (
    <div className="relative p-4 sm:p-5 rounded-2xl rpg-panel border border-amber-500/35 rpg-glow-gold overflow-hidden">
      {/* Warm Embers Ambient Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Familiar Avatar & Speech */}
        <div className="flex items-start sm:items-center gap-3.5">
          {/* Animated Mystic Familiar Orb */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.4)]">
              <Sparkles className="w-6 h-6 animate-pulse text-amber-300" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-black flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1">
                <span>SOLARIA // SANCTUARY FAMILIAR</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-200">
                REALM SAGE
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
