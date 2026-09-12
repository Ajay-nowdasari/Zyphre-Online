'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, User, Quest } from '../lib/api';
import { useTheme, AppTheme } from '../components/ThemeContext';
import { sound } from '../components/AudioEngine';

// RPG Game Client Components
import { GameHUD } from '../components/GameHUD';
import { Sanctuary3DStage } from '../components/Sanctuary3DStage';
import { CompanionFamiliar } from '../components/CompanionFamiliar';
import { TrialsOfValor } from '../components/TrialsOfValor';
import { ColosseumBossRaid } from '../components/ColosseumBossRaid';
import { ChampionsSanctum } from '../components/ChampionsSanctum';
import { RelicArmory } from '../components/RelicArmory';
import { CampaignChronicles } from '../components/CampaignChronicles';
import { InscribeTrialModal } from '../components/InscribeTrialModal';
import { ClassSelectionModal } from '../components/ClassSelectionModal';
import { AuthModal } from '../components/AuthModal';
import { AuditHistoryModal } from '../components/AuditHistoryModal';

export default function Home() {
  const { theme, changeTheme, isMuted, toggleAudioMute } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [characterDetails, setCharacterDetails] = useState<any>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeTab, setActiveTab] = useState<'TRIALS' | 'COLOSSEUM' | 'SANCTUM' | 'ARMORY' | 'CHRONICLE'>('TRIALS');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isInscribeOpen, setIsInscribeOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  // Combat trigger
  const [attackTrigger, setAttackTrigger] = useState(0);

  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    try {
      const meRes = await api.me();
      if (meRes.user) {
        setUser(meRes.user);
        if (meRes.user.activeTheme) {
          changeTheme(meRes.user.activeTheme as AppTheme);
        }
        await loadGameData();
      }
    } catch (err) {
      setIsAuthOpen(true);
    }
  };

  const loadGameData = async () => {
    try {
      const [charRes, questRes] = await Promise.all([
        api.getCharacter(),
        api.getQuests(),
      ]);
      setCharacterDetails(charRes.character);
      setUser(charRes.character);
      setQuests(questRes.quests);
    } catch (err) {
      console.error('Failed to load game data:', err);
    }
  };

  const handleTrialVanquished = (summary: any) => {
    setAttackTrigger((prev) => prev + 1);
    loadGameData();
  };

  const handleLogout = async () => {
    sound.playBlip();
    await api.logout().catch(() => {});
    localStorage.removeItem('life_rpg_token');
    setUser(null);
    setCharacterDetails(null);
    setIsAuthOpen(true);
  };

  const equippedGear =
    user?.inventory
      ?.filter((item) => item.category === 'GEAR' && item.isEquipped)
      ?.map((item) => item.itemKey) || [];

  const xpRequired = characterDetails?.xpRequiredForCurrentLevel || 100;

  return (
    <main className="min-h-screen relative flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Background Ambience Layer */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950/60 to-black" />

      {/* RPG GAME HUD TOP BAR & HOTBAR */}
      <GameHUD
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        isMuted={isMuted}
        onToggleMute={toggleAudioMute}
        xpRequired={xpRequired}
      />

      {/* MAIN GAME ARENA CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* HERO 3D STAGE & COMPANION BRIEFING (Shown prominently on main tabs) */}
        {activeTab === 'TRIALS' && (
          <div className="space-y-4">
            <section className="relative rounded-3xl rpg-panel border border-amber-500/30 overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                {/* Left: Interactive 3D Hero Avatar on Runic Dais */}
                <div className="lg:col-span-7 h-[360px] sm:h-[420px] relative">
                  <Sanctuary3DStage
                    mode="HERO_SANCTUARY"
                    equippedGear={equippedGear}
                    attackTrigger={attackTrigger}
                  />
                </div>

                {/* Right: Champion Dossier & Active Attributes */}
                <div className="lg:col-span-5 p-6 sm:p-8 space-y-5 border-t lg:border-t-0 lg:border-l border-amber-500/20">
                  <div>
                    <button
                      onClick={() => {
                        sound.playBlip();
                        setIsClassModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold hover:text-amber-300 transition-colors"
                      title="Click to change Hero Class"
                    >
                      <span>CLASS: {user?.characterClass ? user.characterClass.replace('_', ' ') : 'VALIANT PALADIN'}</span>
                      <span className="underline text-[9px] text-amber-500">CHANGE</span>
                    </button>
                    <h2 className="text-2xl font-black text-[#fffbeb] font-display mt-0.5">
                      {user?.username || 'LORD VALERIUS'}
                    </h2>
                    <p className="text-xs text-amber-300/90 font-serif italic">
                      "{user?.characterTitle || 'Knight of the Sunlit Oath'}"
                    </p>
                  </div>

                  {/* Core Attributes Snapshot */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-serif">
                    <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30">
                      <span className="text-[9px] font-display text-amber-300 uppercase block font-bold">Arcana</span>
                      <span className="text-base font-bold font-mono text-amber-300">
                        {user?.attributes?.intellect || 14}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-yellow-950/40 border border-yellow-500/30">
                      <span className="text-[9px] font-display text-yellow-300 uppercase block font-bold">Might</span>
                      <span className="text-base font-bold font-mono text-yellow-400">
                        {user?.attributes?.strength || 15}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                      <span className="text-[9px] font-display text-emerald-300 uppercase block font-bold">Fortitude</span>
                      <span className="text-base font-bold font-mono text-emerald-400">
                        {user?.attributes?.vitality || 13}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30">
                      <span className="text-[9px] font-display text-purple-300 uppercase block font-bold">Grace</span>
                      <span className="text-base font-bold font-mono text-purple-400">
                        {user?.attributes?.charisma || 12}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action to Boss Arena */}
                  <div className="p-3 rounded-2xl bg-black/50 border border-amber-500/30 flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="text-rose-400 font-bold block font-display">COLOSSEUM RAID ACTIVE</span>
                      <span className="text-amber-200/70 text-[11px] font-serif">Chronos, The Sloth Wyrm is waiting</span>
                    </div>
                    <button
                      onClick={() => {
                        sound.playBlip();
                        setActiveTab('COLOSSEUM');
                      }}
                      className="rpg-button px-3.5 py-1.5 rounded-xl text-xs font-display font-bold"
                    >
                      ENTER ARENA
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Familiar Lore Briefing */}
            {user && (
              <CompanionFamiliar
                user={user}
                onOpenClassModal={() => setIsClassModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* ACTIVE TAB SECTION CONTENT */}
        <section className="min-h-[420px]">
          {activeTab === 'TRIALS' && (
            <TrialsOfValor
              quests={quests}
              onTrialVanquished={handleTrialVanquished}
              onRefreshTrials={loadGameData}
              onOpenInscribeModal={() => setIsInscribeOpen(true)}
            />
          )}

          {activeTab === 'COLOSSEUM' && user && (
            <ColosseumBossRaid
              user={user}
              onBossDefeated={() => loadGameData()}
            />
          )}

          {activeTab === 'SANCTUM' && user && (
            <ChampionsSanctum
              user={user}
              onStatsUpdated={(updated) => {
                setUser(updated);
                loadGameData();
              }}
              onOpenClassModal={() => setIsClassModalOpen(true)}
            />
          )}

          {activeTab === 'ARMORY' && user && (
            <RelicArmory
              user={user}
              onUserUpdated={(updated) => {
                setUser(updated);
                loadGameData();
              }}
              onThemeChanged={(newTheme) => {
                // Theme changed
              }}
            />
          )}

          {activeTab === 'CHRONICLE' && user && (
            <CampaignChronicles user={user} />
          )}
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-amber-500/20 py-6 px-4 text-center text-xs font-mono text-slate-500">
        <p>
          ⚔️ AETHERIA: ASCENDANT ODYSSEY — Real-World Productivity Transformed into a Full-Scale RPG
        </p>
      </footer>

      {/* RPG MODALS */}
      <InscribeTrialModal
        isOpen={isInscribeOpen}
        onClose={() => setIsInscribeOpen(false)}
        onTrialInscribed={() => loadGameData()}
      />

      <ClassSelectionModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        currentUser={user || ({} as any)}
        onClassUpdated={(updated) => {
          setUser(updated);
          loadGameData();
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(authedUser) => {
          setUser(authedUser);
          loadGameData();
        }}
      />

      <AuditHistoryModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />
    </main>
  );
}
