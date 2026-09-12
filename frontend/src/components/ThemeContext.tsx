'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { sound } from './AudioEngine';

export type AppTheme = 'CYBERPUNK' | 'LOFI' | 'RETRO_DUNGEON';

interface ThemeContextType {
  theme: AppTheme;
  changeTheme: (newTheme: AppTheme) => void;
  isMuted: boolean;
  toggleAudioMute: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'CYBERPUNK',
  changeTheme: () => {},
  isMuted: false,
  toggleAudioMute: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('CYBERPUNK');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    // Load local stored theme if any
    const savedTheme = localStorage.getItem('life_rpg_theme') as AppTheme;
    if (savedTheme && ['CYBERPUNK', 'LOFI', 'RETRO_DUNGEON'].includes(savedTheme)) {
      setThemeState(savedTheme);
      applyBodyTheme(savedTheme);
    }
    setIsMuted(sound.getIsMuted());
  }, []);

  const applyBodyTheme = (t: AppTheme) => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('theme-lofi', 'theme-retro');
      if (t === 'LOFI') {
        document.body.classList.add('theme-lofi');
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
