'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Dumbbell, Heart, Users, Check, Sparkles, Shield, Zap } from 'lucide-react';
import { api, User } from '../lib/api';
import { sound } from './AudioEngine';

interface ClassSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onClassUpdated: (updatedUser: User) => void;
}

const CLASSES = [
  {
    key: 'CODE_SORCERER',
    name: 'Code Sorcerer',
    title: 'Weaver of Silicon & Logic',
    attribute: 'INTELLECT',
    lore: 'Channels the flow of computational logic, turning code syntax into digital power and architecture into impenetrable bastions.',
    perk: '+15% bonus XP on all Intellect & deep work trials.',
    icon: Brain,
    color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
  },
  {
    key: 'KINETIC_VANGUARD',
    name: 'Kinetic Vanguard',
    title: 'Champion of Iron Will',
    attribute: 'STRENGTH',
    lore: 'Hardened through relentless biological discipline and physical exertion. Treats every real-world obstacle as resistance to be overcome.',
    perk: '+20% bonus Gold mined on all physical conditioning tasks.',
    icon: Dumbbell,
    color: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
  },
  {
    key: 'BIO_SENTINEL',
    name: 'Bio-Sentinel',
    title: 'Guardian of Cellular Equilibrium',
    lore: 'Master of somatic restoration, deep sleep, and nervous system recovery. Protects the mind and vessel from fatigue.',
    perk: 'Grants +1 additional maximum Streak Freeze capacity and faster resilience recovery.',
    icon: Heart,
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  },
  {
    key: 'CYBER_INFILTRATOR',
    name: 'Cyber Infiltrator',
    title: 'Diplomat of the Neon Grid',
    lore: 'Navigates human networks, leadership alliances, and social engineering. Unlocks closed doors through charisma and influence.',
    perk: 'Permanent 15% discount across all merchant catalog offerings in the Bazaar.',
    icon: Users,
    color: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
  },
];

export const ClassSelectionModal: React.FC<ClassSelectionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onClassUpdated,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(
    currentUser.characterClass || 'CODE_SORCERER'
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSelect = async (classKey: string) => {
    setSelectedKey(classKey);
    setIsSaving(true);
    sound.playLevelUp();

    try {
      const res = await api.selectClass(classKey);
      onClassUpdated(res.user);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update character class');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl p-6 glass-panel rounded-3xl border border-cyan-500/30 glow-cyan max-h-[90vh] overflow-y-auto"
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

          <div className="mb-6">
            <h2 id="class-modal-title" className="text-xl font-bold font-mono text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>CHOOSE YOUR HERO CLASS & ARCHETYPE</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your roleplaying specialization. Each class grants unique passive traits and narrative identity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLASSES.map((cls) => {
              const Icon = cls.icon;
              const isCurrent = currentUser.characterClass === cls.key;
              const isSelected = selectedKey === cls.key;

              return (
                <div
                  key={cls.key}
                  onClick={() => handleSelect(cls.key)}
                  className={`p-5 rounded-2xl glass-panel border cursor-pointer transition-all ${
                    isCurrent
                      ? 'border-cyan-400 ring-1 ring-cyan-400 glow-cyan'
                      : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cls.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isCurrent ? (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-400 text-black">
                        ACTIVE CLASS
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">
                        {cls.attribute} FOCUS
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold font-mono text-white">{cls.name}</h3>
                  <span className="text-xs text-cyan-300 font-mono block mb-2">{cls.title}</span>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed mb-3">
                    {cls.lore}
                  </p>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-emerald-300">
                    <strong>Passive Perk:</strong> {cls.perk}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
