'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Clock, Sparkles, Coins, ArrowUpRight } from 'lucide-react';
import { api, AuditLog } from '../lib/api';
import { sound } from './AudioEngine';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs();
      setLogs(res.logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl p-6 glass-panel rounded-2xl border border-cyan-500/30 glow-cyan max-h-[85vh] flex flex-col"
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

          <div className="mb-4">
            <h2 id="audit-modal-title" className="text-xl font-bold font-mono text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>ACID AUDIT & INTEGRITY LEDGER</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Zero-Trust stat validation record. Every XP, Gold, and Level progression is verified and persisted in relational database tables.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="py-12 text-center font-mono text-xs text-slate-400 animate-pulse">
                Querying cryptographic audit logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-slate-500">
                No ledger transactions recorded yet. Complete a quest to start verification history.
              </div>
            ) : (
              logs.map((log) => {
                let metadata: any = {};
                try {
                  if (log.details) metadata = JSON.parse(log.details);
                } catch (e) {}

                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1 font-mono">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {log.actionType}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-300 font-sans">
                        {metadata.questTitle
                          ? `Completed: "${metadata.questTitle}" (${metadata.difficulty})`
                          : metadata.itemName
                          ? `Acquired: "${metadata.itemName}"`
                          : metadata.rewardTitle
                          ? `Redeemed: "${metadata.rewardTitle}"`
                          : log.actionType}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 font-mono shrink-0">
                      {log.xpDelta !== null && log.xpDelta !== undefined && log.xpDelta > 0 && (
                        <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                          +{log.xpDelta} XP
                        </span>
                      )}
                      {log.goldDelta !== null && log.goldDelta !== undefined && (
                        <span
                          className={`font-bold px-2 py-0.5 rounded border ${
                            log.goldDelta >= 0
                              ? 'text-amber-400 bg-amber-950/60 border-amber-500/30'
                              : 'text-rose-400 bg-rose-950/60 border-rose-500/30'
                          }`}
                        >
                          {log.goldDelta > 0 ? `+${log.goldDelta}` : log.goldDelta} G
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
