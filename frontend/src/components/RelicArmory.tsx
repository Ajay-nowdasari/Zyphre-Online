'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Castle,
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
  Plus,
  Trash2,
  Beer,
  Zap,
} from 'lucide-react';
import { api, ShopItem, CustomReward, User } from '../lib/api';
import { sound } from './AudioEngine';
import { useTheme, AppTheme } from './ThemeContext';

interface RelicArmoryProps {
  user: User;
  onUserUpdated: (updatedUser: User) => void;
  onThemeChanged: (theme: AppTheme) => void;
}

export const RelicArmory: React.FC<RelicArmoryProps> = ({
  user,
  onUserUpdated,
  onThemeChanged,
}) => {
  const { changeTheme } = useTheme();
  const [catalog, setCatalog] = useState<ShopItem[]>([]);
  const [customRewards, setCustomRewards] = useState<CustomReward[]>([]);
  const [category, setCategory] = useState<'WEAPONS' | 'THEMES' | 'STASIS' | 'TAVERN'>('WEAPONS');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>('');

  // Tavern feast creation
  const [newTitle, setNewTitle] = useState('');
  const [newCost, setNewCost] = useState(100);
  const [newDesc, setNewDesc] = useState('');
  const [showTavernForm, setShowTavernForm] = useState(false);

  useEffect(() => {
    loadArmory();
  }, [user.id]);

  const loadArmory = async () => {
    setIsLoading(true);
    try {
      const [catRes, customRes] = await Promise.all([
        api.getShopCatalog(),
        api.getCustomRewards(),
      ]);
      setCatalog(catRes.catalog);
      setCustomRewards(customRes.rewards);
    } catch (err) {
      console.error('Failed to load armory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const notify = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4500);
  };

  const handleAcquire = async (item: ShopItem) => {
    if (actionLoading) return;
    setActionLoading(item.itemKey);
    sound.playBlip();

    try {
      const res = await api.purchaseShopItem(item.itemKey);
      sound.playCoin();
      notify(res.message);
      onUserUpdated(res.user);

      if (item.category === 'THEME') {
        const tKey = item.itemKey.replace('THEME_', '') as AppTheme;
        changeTheme(tKey);
        onThemeChanged(tKey);
      }

      await loadArmory();
    } catch (err: any) {
      notify(err.message || 'Transaction failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEquipWeapon = async (itemKey: string, currentlyEquipped: boolean) => {
    if (actionLoading) return;
    setActionLoading(itemKey);
    sound.playBlip();

    try {
      await api.equipItem(itemKey, !currentlyEquipped);
      const charRes = await api.getCharacter();
      onUserUpdated(charRes.character);
      await loadArmory();
      notify(currentlyEquipped ? 'Weapon placed in scabbard' : 'Legendary 3D Weapon mounted to Hero Avatar!');
    } catch (err: any) {
      notify(err.message || 'Failed to equip weapon');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSwitchTheme = async (themeKey: AppTheme) => {
    try {
      sound.playThemeSwitch();
      await api.setTheme(themeKey);
      changeTheme(themeKey);
      onThemeChanged(themeKey);
      const charRes = await api.getCharacter();
      onUserUpdated(charRes.character);
      await loadArmory();
    } catch (err: any) {
      notify(err.message || 'Theme switch failed');
    }
  };

  const handleCreateTavernReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      sound.playBlip();
      const res = await api.createCustomReward({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        cost: Number(newCost),
      });

      setCustomRewards([res.reward, ...customRewards]);
      setNewTitle('');
      setNewDesc('');
      setShowTavernForm(false);
      notify(`Tavern reward "${res.reward.title}" bound to menu!`);
    } catch (err: any) {
      notify(err.message || 'Creation error');
    }
  };

  const handleClaimTavernReward = async (reward: CustomReward) => {
    if (actionLoading) return;
    setActionLoading(reward.id);
    sound.playBlip();

    try {
      const res = await api.claimCustomReward(reward.id);
      sound.playCoin();
      notify(res.message);
      onUserUpdated(res.user);
      await loadArmory();
    } catch (err: any) {
      notify(err.message || 'Claim error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTavernReward = async (id: string) => {
    if (!confirm('Remove this treat from the Tavern?')) return;
    try {
      sound.playBlip();
      await api.deleteCustomReward(id);
      setCustomRewards(customRewards.filter((r) => r.id !== id));
    } catch (err: any) {
      notify(err.message || 'Delete error');
    }
  };

  const weaponItems = catalog.filter((i) => i.category === 'GEAR');
  const themeItems = catalog.filter((i) => i.category === 'THEME');
  const consumableItems = catalog.filter((i) => i.category === 'CONSUMABLE');

  return (
    <div className="space-y-6">
      {/* Header & Dragon Gold Purse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <Castle className="w-5 h-5 text-amber-400" />
            <span>THE GRAND ARMORY & RELIC VAULT</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Spend mined Dragon Gold on 3D legendary weapons, Aegis stasis runes, visual realm skins, and tavern feasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono font-bold text-sm shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Coins className="w-4 h-4 text-amber-300" />
            <span>{user.currentGold} DRAGON GOLD</span>
          </div>
        </div>
      </div>

      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notice}</span>
        </motion.div>
      )}

      {/* Armory Category Hotbar */}
      <div className="flex items-center gap-2 p-1.5 bg-black/60 rounded-2xl border border-amber-500/30 overflow-x-auto">
        {[
          { id: 'WEAPONS', label: '3D Legendary Relics', icon: Sword },
          { id: 'THEMES', label: 'Visual Realms', icon: Palette },
          { id: 'STASIS', label: 'Runes of Stasis', icon: Snowflake },
          { id: 'TAVERN', label: 'Tavern Feasts & Treats', icon: Beer },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = category === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playBlip();
                setCategory(tab.id as any);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3D WEAPONS & RELICS */}
      {category === 'WEAPONS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {weaponItems.map((item) => {
            const isProcessing = actionLoading === item.itemKey;

            return (
              <div
                key={item.itemKey}
                className={`p-5 rounded-2xl rpg-panel border flex flex-col justify-between transition-all ${
                  item.isEquipped ? 'border-amber-400 rpg-glow-gold' : 'hover:border-amber-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-black/50 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Sword className="w-5 h-5" />
                    </div>
                    {item.isEquipped ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-black">
                        EQUIPPED (3D)
                      </span>
                    ) : item.isOwned ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30">
                        IN SCABBARD
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
                      onClick={() => handleEquipWeapon(item.itemKey, item.isEquipped)}
                      disabled={isProcessing}
                      className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 ${
                        item.isEquipped
                          ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                          : 'rpg-button'
                      }`}
                    >
                      {item.isEquipped ? 'UNEQUIP 3D WEAPON' : 'MOUNT TO 3D AVATAR'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAcquire(item)}
                      disabled={isProcessing || user.currentGold < item.discountedPrice}
                      className="rpg-button w-full py-2 rounded-xl text-xs font-mono font-bold disabled:opacity-40 active:scale-95"
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

      {/* VISUAL REALMS (THEMES) */}
      {category === 'THEMES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeItems.map((item) => {
            const rawTheme = item.itemKey.replace('THEME_', '') as AppTheme;
            const isCurrentActive = user.activeTheme === rawTheme;
            const isProcessing = actionLoading === item.itemKey;

            return (
              <div
                key={item.itemKey}
                className={`p-5 rounded-2xl rpg-panel border flex flex-col justify-between transition-all ${
                  isCurrentActive ? 'border-amber-400 rpg-glow-gold' : 'hover:border-amber-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-black/50 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Palette className="w-5 h-5" />
                    </div>
                    {isCurrentActive ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-black">
                        ACTIVE REALM
                      </span>
                    ) : item.isOwned ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30">
                        UNLOCKED
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
                      <Check className="w-4 h-4 text-amber-400" />
                      <span>CURRENT REALM</span>
                    </button>
                  ) : item.isOwned ? (
                    <button
                      onClick={() => handleSwitchTheme(rawTheme)}
                      className="rpg-button w-full py-2 rounded-xl text-xs font-mono font-bold active:scale-95"
                    >
                      ENTER THIS REALM
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAcquire(item)}
                      disabled={isProcessing || user.currentGold < item.discountedPrice}
                      className="rpg-button w-full py-2 rounded-xl text-xs font-mono font-bold disabled:opacity-40 active:scale-95"
                    >
                      {isProcessing ? 'SYNCHRONIZING...' : `UNLOCK FOR ${item.discountedPrice} G`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STASIS RUNES */}
      {category === 'STASIS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {consumableItems.map((item) => {
            const isProcessing = actionLoading === item.itemKey;

            return (
              <div
                key={item.itemKey}
                className="p-5 rounded-2xl rpg-panel border hover:border-sky-500/40 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                      <Snowflake className="w-6 h-6" />
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
                    onClick={() => handleAcquire(item)}
                    disabled={isProcessing || user.currentGold < item.discountedPrice}
                    className="rpg-button w-full py-2.5 rounded-xl text-xs font-mono font-bold disabled:opacity-40 active:scale-95"
                  >
                    {isProcessing ? 'SYNCHRONIZING...' : `ACQUIRE (${item.discountedPrice} GOLD)`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAVERN FEASTS & TREATS (CUSTOM REWARDS) */}
      {category === 'TAVERN' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Configure guilt-free real-world rewards and celebrations. Spend hard-won Dragon Gold to indulge.
            </p>
            <button
              onClick={() => {
                sound.playBlip();
                setShowTavernForm(!showTavernForm);
              }}
              className="rpg-button-secondary px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showTavernForm ? 'Cancel' : 'Add Tavern Feast'}</span>
            </button>
          </div>

          {showTavernForm && (
            <motion.form
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleCreateTavernReward}
              className="p-4 rounded-2xl rpg-panel border border-amber-500/40 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono text-amber-300 mb-1">
                    Feast Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 1 Hour Video Games, Artisan Coffee, Watch a Movie"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-amber-300 mb-1">
                    Dragon Gold Cost
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    required
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-amber-300 mb-1">
                  Conditions for Feast
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Terms for granting yourself this reward..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="rpg-button w-full py-2 rounded-xl text-xs font-mono font-bold"
              >
                BIND FEAST TO TAVERN MENU
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
                  className="p-4 rounded-2xl rpg-panel border hover:border-amber-500/40 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{r.cost} GOLD</span>
                      </div>
                      <button
                        onClick={() => handleDeleteTavernReward(r.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove feast"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white font-mono">{r.title}</h4>
                    {r.description && (
                      <p className="text-xs text-slate-400 mt-1">{r.description}</p>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono mt-2 block">
                      Enjoyed {r.timesRedeemed} times
                    </span>
                  </div>

                  <button
                    onClick={() => handleClaimTavernReward(r)}
                    disabled={!canAfford || isClaiming}
                    className="rpg-button w-full mt-4 py-2 rounded-xl text-xs font-mono font-bold disabled:opacity-30 active:scale-95"
                  >
                    {isClaiming ? 'CONSUMING...' : `REDEEM FOR ${r.cost} G`}
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
