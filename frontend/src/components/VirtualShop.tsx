'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Coins,
  Sparkles,
  Shield,
  Palette,
  Check,
  Sword,
  Feather,
  ShieldAlert,
  Crown,
  Snowflake,
  Coffee,
  Plus,
  Trash2,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import { api, ShopItem, CustomReward, User } from '../lib/api';
import { sound } from './AudioEngine';
import { useTheme, AppTheme } from './ThemeContext';

interface VirtualShopProps {
  user: User;
  onUserUpdated: (updatedUser: User) => void;
  onThemeChanged: (theme: AppTheme) => void;
}

export const VirtualShop: React.FC<VirtualShopProps> = ({
  user,
  onUserUpdated,
  onThemeChanged,
}) => {
  const { changeTheme } = useTheme();
  const [catalog, setCatalog] = useState<ShopItem[]>([]);
  const [customRewards, setCustomRewards] = useState<CustomReward[]>([]);
  const [activeCategory, setActiveCategory] = useState<'THEMES' | 'GEAR' | 'CONSUMABLES' | 'CUSTOM'>('THEMES');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>('');

  // Custom reward creation form state
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardCost, setNewRewardCost] = useState(100);
  const [newRewardDesc, setNewRewardDesc] = useState('');
  const [showRewardForm, setShowRewardForm] = useState(false);

  useEffect(() => {
    loadShopData();
  }, [user.id]);

  const loadShopData = async () => {
    setIsLoading(true);
    try {
      const [shopRes, customRes] = await Promise.all([
        api.getShopCatalog(),
        api.getCustomRewards(),
      ]);
      setCatalog(shopRes.catalog);
      setCustomRewards(customRes.rewards);
    } catch (err) {
      console.error('Failed to load shop data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4500);
  };

  const handlePurchase = async (item: ShopItem) => {
    if (actionLoading) return;
    setActionLoading(item.itemKey);
    sound.playBlip();

    try {
      const res = await api.purchaseShopItem(item.itemKey);
      sound.playCoin();
      showNotice(res.message);
      onUserUpdated(res.user);

      if (item.category === 'THEME') {
        const themeKey = item.itemKey.replace('THEME_', '') as AppTheme;
        changeTheme(themeKey);
        onThemeChanged(themeKey);
      }

      await loadShopData();
    } catch (err: any) {
      showNotice(err.message || 'Failed to complete transaction');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEquipGear = async (itemKey: string, currentlyEquipped: boolean) => {
    if (actionLoading) return;
    setActionLoading(itemKey);
    sound.playBlip();

    try {
      await api.equipItem(itemKey, !currentlyEquipped);
      // Refresh user character
      const charRes = await api.getCharacter();
      onUserUpdated(charRes.character);
      await loadShopData();
      showNotice(currentlyEquipped ? 'Gear unequipped' : '3D Gear mounted to Avatar!');
    } catch (err: any) {
      showNotice(err.message || 'Failed to update equipment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelectTheme = async (themeKey: AppTheme) => {
    try {
      sound.playThemeSwitch();
      await api.setTheme(themeKey);
      changeTheme(themeKey);
      onThemeChanged(themeKey);
      const charRes = await api.getCharacter();
      onUserUpdated(charRes.character);
      await loadShopData();
    } catch (err: any) {
      showNotice(err.message || 'Failed to switch theme');
    }
  };

  const handleCreateCustomReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardTitle.trim()) return;

    try {
      sound.playBlip();
      const res = await api.createCustomReward({
        title: newRewardTitle.trim(),
        description: newRewardDesc.trim() || undefined,
        cost: Number(newRewardCost),
      });

      setCustomRewards([res.reward, ...customRewards]);
      setNewRewardTitle('');
      setNewRewardDesc('');
      setShowRewardForm(false);
      showNotice(`Custom reward "${res.reward.title}" bound!`);
    } catch (err: any) {
      showNotice(err.message || 'Failed to create reward');
    }
  };

  const handleClaimReward = async (reward: CustomReward) => {
    if (actionLoading) return;
    setActionLoading(reward.id);
    sound.playBlip();

    try {
      const res = await api.claimCustomReward(reward.id);
      sound.playCoin();
      showNotice(res.message);
      onUserUpdated(res.user);
      await loadShopData();
    } catch (err: any) {
      showNotice(err.message || 'Failed to claim reward');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCustomReward = async (id: string) => {
    if (!confirm('Dismiss this custom reward?')) return;
    try {
      sound.playBlip();
      await api.deleteCustomReward(id);
      setCustomRewards(customRewards.filter((r) => r.id !== id));
    } catch (err: any) {
      showNotice(err.message || 'Failed to delete reward');
    }
  };

  const getItemIcon = (itemKey: string) => {
    switch (itemKey) {
      case 'GEAR_CYBER_KATANA':
        return <Sword className="w-6 h-6 text-cyan-400" />;
      case 'GEAR_CHRONO_WINGS':
        return <Feather className="w-6 h-6 text-fuchsia-400" />;
      case 'GEAR_AEGIS_SHIELD':
        return <ShieldAlert className="w-6 h-6 text-blue-400" />;
      case 'GEAR_RUNIC_HALO':
        return <Crown className="w-6 h-6 text-amber-400" />;
      case 'STREAK_FREEZE':
        return <Snowflake className="w-6 h-6 text-sky-400" />;
      case 'POTION_MIND_ELIXIR':
        return <Sparkles className="w-6 h-6 text-purple-400" />;
      default:
        return <Palette className="w-6 h-6 text-cyan-400" />;
    }
  };

  const themeItems = catalog.filter((i) => i.category === 'THEME');
  const gearItems = catalog.filter((i) => i.category === 'GEAR');
  const consumableItems = catalog.filter((i) => i.category === 'CONSUMABLE');

  return (
    <div className="space-y-6">
      {/* Header & Wallet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>VIRTUAL BAZAAR & REWARDS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Spend mined Gold on cosmetic visual themes, 3D avatar gear, streak shields, and real-world treats.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Coins className="w-4 h-4" />
            <span>{user.currentGold} GOLD</span>
          </div>
        </div>
      </div>

      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{notification}</span>
        </motion.div>
      )}

      {/* Category Navigation */}
      <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/5 overflow-x-auto">
        {[
          { id: 'THEMES', label: 'Cosmetic Themes', icon: Palette },
          { id: 'GEAR', label: '3D Avatar Gear', icon: Sword },
          { id: 'CONSUMABLES', label: 'Consumables & Freezes', icon: Snowflake },
          { id: 'CUSTOM', label: 'Real-World Rewards', icon: Gift },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playBlip();
                setActiveCategory(tab.id as any);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* THEMES TAB */}
      {activeCategory === 'THEMES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeItems.map((item) => {
            const rawTheme = item.itemKey.replace('THEME_', '') as AppTheme;
            const isCurrentActive = user.activeTheme === rawTheme;
            const isProcessing = actionLoading === item.itemKey;

            return (
              <div
                key={item.itemKey}
                className={`p-5 rounded-2xl glass-panel border flex flex-col justify-between transition-all ${
                  isCurrentActive
                    ? 'border-cyan-400 glow-cyan ring-1 ring-cyan-400'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-cyan-400" />
                    </div>
                    {isCurrentActive ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-400 text-black">
                        ACTIVE THEME
                      </span>
                    ) : item.isOwned ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30">
                        OWNED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                        <Coins className="w-3.5 h-3.5" />
                        {item.discountedPrice} G
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white font-mono">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5">
                  {isCurrentActive ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-xl text-xs font-mono font-bold bg-white/5 text-slate-400 border border-white/10 flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-cyan-400" />
                      <span>CURRENTLY ACTIVE</span>
                    </button>
                  ) : item.isOwned ? (
                    <button
                      onClick={() => handleSelectTheme(rawTheme)}
                      className="w-full py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all active:scale-95"
                    >
                      ACTIVATE THEME
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={isProcessing || user.currentGold < item.discountedPrice}
                      className="w-full py-2 rounded-xl text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-40 transition-all active:scale-95"
                    >
                      {isProcessing ? 'SYNCHRONIZING...' : `UNLOCK FOR ${item.discountedPrice} GOLD`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3D GEAR TAB */}
      {activeCategory === 'GEAR' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gearItems.map((item) => {
            const isProcessing = actionLoading === item.itemKey;

            return (
              <div
                key={item.itemKey}
                className={`p-4 rounded-2xl glass-panel border flex flex-col justify-between transition-all ${
                  item.isEquipped
                    ? 'border-cyan-400 glow-cyan'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
                      {getItemIcon(item.itemKey)}
                    </div>
                    {item.isEquipped ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-400 text-black">
                        EQUIPPED (3D)
                      </span>
                    ) : item.isOwned ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30">
                        OWNED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                        <Coins className="w-3.5 h-3.5" />
                        {item.discountedPrice} G
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white font-mono">{item.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                  {item.isOwned ? (
                    <button
                      onClick={() => handleEquipGear(item.itemKey, item.isEquipped)}
                      disabled={isProcessing}
                      className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 ${
                        item.isEquipped
                          ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                          : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {item.isEquipped ? 'UNEQUIP 3D GEAR' : 'MOUNT TO 3D AVATAR'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={isProcessing || user.currentGold < item.discountedPrice}
                      className="w-full py-2 rounded-xl text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-40 transition-all active:scale-95"
                    >
                      {isProcessing ? 'FORGING...' : `FORGE FOR ${item.discountedPrice} G`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONSUMABLES TAB */}
      {activeCategory === 'CONSUMABLES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {consumableItems.map((item) => {
            const isProcessing = actionLoading === item.itemKey;

            return (
              <div
                key={item.itemKey}
                className="p-5 rounded-2xl glass-panel border border-white/10 hover:border-sky-500/30 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                      {getItemIcon(item.itemKey)}
                    </div>
                    <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                      <Coins className="w-3.5 h-3.5" />
                      {item.discountedPrice} G
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white font-mono">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={isProcessing || user.currentGold < item.discountedPrice}
                    className="w-full py-2.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-black shadow-[0_0_15px_rgba(56,189,248,0.3)] disabled:opacity-40 transition-all active:scale-95"
                  >
                    {isProcessing ? 'SYNCHRONIZING...' : `ACQUIRE (${item.discountedPrice} GOLD)`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CUSTOM REAL-WORLD REWARDS TAB (SRS 4.4) */}
      {activeCategory === 'CUSTOM' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Configure personal dopamine rewards in the real world. Spend gold to redeem guilt-free leisure.
            </p>
            <button
              onClick={() => {
                sound.playBlip();
                setShowRewardForm(!showRewardForm);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showRewardForm ? 'Cancel' : 'Add Custom Reward'}</span>
            </button>
          </div>

          {showRewardForm && (
            <motion.form
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleCreateCustomReward}
              className="p-4 rounded-2xl glass-panel border border-cyan-500/30 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Reward Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newRewardTitle}
                    onChange={(e) => setNewRewardTitle(e.target.value)}
                    placeholder="e.g. 1 Hour Video Games, Order Pizza, Watch a Movie"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Cost in Gold
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    required
                    value={newRewardCost}
                    onChange={(e) => setNewRewardCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Optional Rationale
                </label>
                <input
                  type="text"
                  value={newRewardDesc}
                  onChange={(e) => setNewRewardDesc(e.target.value)}
                  placeholder="Terms for granting yourself this reward..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl text-xs font-mono font-bold bg-cyan-400 hover:bg-cyan-300 text-black shadow-md transition-all"
              >
                SAVE REWARD TO BAZAAR
              </button>
            </motion.form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {customRewards.map((r) => {
              const canAfford = user.currentGold >= r.cost;
              const isClaiming = actionLoading === r.id;

              return (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-amber-500/30 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{r.cost} G</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCustomReward(r.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        aria-label="Delete reward"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-semibold text-white font-mono">{r.title}</h4>
                    {r.description && (
                      <p className="text-xs text-slate-400 mt-1">{r.description}</p>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono mt-2 block">
                      Redeemed {r.timesRedeemed} times
                    </span>
                  </div>

                  <button
                    onClick={() => handleClaimReward(r)}
                    disabled={!canAfford || isClaiming}
                    className="w-full mt-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)] disabled:opacity-30 transition-all active:scale-95"
                  >
                    {isClaiming ? 'REDEEMING...' : `REDEEM FOR ${r.cost} G`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
