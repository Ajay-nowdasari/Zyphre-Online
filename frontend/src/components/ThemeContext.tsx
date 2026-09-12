'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { sound } from './AudioEngine';

export type AppTheme = 'ELDEN_REALM' | 'CATHEDRAL_ARCANA' | 'RETRO_DUNGEON';

interface ThemeContextType {
  theme: AppTheme;
  changeTheme: (newTheme: AppTheme) => void;
  isMuted: boolean;
  toggleAudioMute: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'ELDEN_REALM',
  changeTheme: () => {},
  isMuted: false,
  toggleAudioMute: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('ELDEN_REALM');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    // Load local stored theme if any
    const savedTheme = localStorage.getItem('life_rpg_theme') as AppTheme;
    if (savedTheme && ['ELDEN_REALM', 'CATHEDRAL_ARCANA', 'RETRO_DUNGEON'].includes(savedTheme)) {
      setThemeState(savedTheme);
      applyBodyTheme(savedTheme);
    }
    setIsMuted(sound.getIsMuted());
  }, []);

  const applyBodyTheme = (t: AppTheme) => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('theme-cathedral', 'theme-retro');
      if (t === 'CATHEDRAL_ARCANA') {
        document.body.classList.add('theme-cathedral');
      } else if (t === 'RETRO_DUNGEON') {
        document.body.classList.add('theme-retro');
      }
    }
  };

  const changeTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    applyBodyTheme(newTheme);
    localStorage.setItem('life_rpg_theme', newTheme);
    sound.playThemeSwitch();
  };

  const toggleAudioMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, isMuted, toggleAudioMute }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
