'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User as UserIcon, Zap, ShieldCheck } from 'lucide-react';
import { api, User } from '../lib/api';
import { sound } from './AudioEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    sound.playBlip();

    try {
      if (mode === 'login') {
        const res = await api.login({ email, password });
        if (res.token) localStorage.setItem('life_rpg_token', res.token);
        sound.playCoin();
        onAuthSuccess(res.user);
        onClose();
      } else {
        const res = await api.register({ email, password, username });
        if (res.token) localStorage.setItem('life_rpg_token', res.token);
        sound.playLevelUp();
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsLoading(true);
    sound.playBlip();

    try {
      const res = await api.login({
        email: 'demo@liferpg.dev',
        password: 'password123',
      });
      if (res.token) localStorage.setItem('life_rpg_token', res.token);
      sound.playCoin();
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      // If demo user wasn't seeded yet, register it directly
      try {
        const regRes = await api.register({
          email: 'demo@liferpg.dev',
          password: 'password123',
          username: 'CyberVanguard',
        });
        if (regRes.token) localStorage.setItem('life_rpg_token', regRes.token);
        sound.playLevelUp();
        onAuthSuccess(regRes.user);
        onClose();
      } catch (regErr: any) {
        setError(regErr.message || 'Failed to initialize demo session');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md p-6 glass-panel rounded-2xl border border-cyan-500/30 glow-cyan"
        >
          {/* Close button */}
          <button
            onClick={() => {
              sound.playBlip();
              onClose();
            }}
            aria-label="Close authentication modal"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 mb-3 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 id="auth-modal-title" className="text-2xl font-bold tracking-tight text-white font-mono">
              {mode === 'login' ? 'CHAMPION LOGIN' : 'CREATE AVATAR'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login'
                ? 'Enter your neural link to synchronize your Life RPG character.'
                : 'Initialize your biometric profile and claim your starting gear.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-black/40 rounded-xl mb-5 border border-white/5">
            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setMode('login');
                setError('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setMode('register');
                setError('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              REGISTER
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Hero Codename
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. CyberVanguard"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Neural Comm (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hero@life-rpg.dev"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold font-mono text-sm tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? 'ESTABLISHING LINK...' : mode === 'login' ? 'ACCESS RPG DECK' : 'INITIALIZE CHAMPION'}
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="mt-5 pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>INSTANT 1-CLICK DEMO LOGIN (Ready Hero)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
