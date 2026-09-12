'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lock, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { api, User } from '../lib/api';

interface CampaignChroniclesProps {
  user: User;
}

export const CampaignChronicles: React.FC<CampaignChroniclesProps> = ({ user }) => {
  const [campaign, setCampaign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCampaign();
  }, [user.level]);

  const loadCampaign = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCampaign();
      setCampaign(res);
    } catch (err) {
      console.error('Failed to load campaign:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !campaign) {
    return (
      <div className="p-8 rounded-2xl glass-panel text-center font-mono text-xs text-slate-400 animate-pulse">
        Deciphering chronicles of the Ascendant Codex...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#fffbeb] font-display flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span>CHRONICLES OF THE ELDEN REALM</span>
        </h2>
        <p className="text-xs text-amber-200/70 mt-0.5 font-serif">
          Advance your champion through trials to unlock subsequent illuminations in the ongoing crusade of discipline.
        </p>
      </div>

      <div className="space-y-4">
        {campaign.chapters.map((ch: any) => {
          const isUnlocked = ch.isUnlocked;
          const isCurrent = ch.isCurrent;

          return (
            <motion.div
              key={ch.chapter}
              whileHover={{ y: isUnlocked ? -2 : 0 }}
              className={`p-5 rounded-2xl glass-panel border transition-all ${
                isCurrent
                  ? 'border-cyan-400 glow-cyan ring-1 ring-cyan-400 bg-cyan-950/20'
                  : isUnlocked
                  ? 'border-white/10 hover:border-white/20'
                  : 'border-white/5 opacity-50 bg-black/40'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                      CHAPTER {ch.chapter}
                    </span>
                    {isCurrent ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-400 text-black">
                        CURRENT ODYSSEY
                      </span>
                    ) : isUnlocked ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>CONQUERED</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-black/40 border border-white/5 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>REQUIRES LEVEL {ch.requiredLevel}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold font-mono text-white">{ch.title}</h3>

                  {isUnlocked ? (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs text-slate-300 font-sans leading-relaxed italic border-l-2 border-cyan-500/40 pl-3">
                        {ch.prologue}
                      </p>
                      {user.level > ch.requiredLevel && (
                        <p className="text-xs text-emerald-300/90 font-sans leading-relaxed border-l-2 border-emerald-500/40 pl-3">
                          <strong>Resolution:</strong> {ch.epilogue}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 font-sans italic pt-1">
                      This chapter is encrypted in the neural archives. Reach Level {ch.requiredLevel} to unlock this lore.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
