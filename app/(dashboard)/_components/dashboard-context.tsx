'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ServerUser } from '../../services/serverDb';

interface DashboardContextType {
  xp: number;
  level: number;
  streak: number;
  displayName: string;
  avatar: string;
  updateStats: (newXp: number, newLevel: number, newStreak: number) => void;
  updateDisplayName: (newName: string) => void;
  updateAvatar: (newAvatar: string) => void;
  syncUser: (user: ServerUser) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: ServerUser;
}) {
  const [xp, setXp] = useState(initialUser.xp);
  const [level, setLevel] = useState(initialUser.level);
  const [streak, setStreak] = useState(initialUser.streak);
  const [displayName, setDisplayName] = useState(initialUser.displayName);
  const [avatar, setAvatar] = useState(initialUser.avatar || '🦉');

  const updateStats = (newXp: number, newLevel: number, newStreak: number) => {
    setXp(newXp);
    setLevel(newLevel);
    setStreak(newStreak);
  };

  const updateDisplayName = (newName: string) => {
    setDisplayName(newName);
  };

  const updateAvatar = (newAvatar: string) => {
    setAvatar(newAvatar);
  };

  const syncUser = (user: ServerUser) => {
    setXp(user.xp);
    setLevel(user.level);
    setStreak(user.streak);
    setDisplayName(user.displayName);
    setAvatar(user.avatar || '🦉');
  };

  return (
    <DashboardContext.Provider
      value={{
        xp,
        level,
        streak,
        displayName,
        avatar,
        updateStats,
        updateDisplayName,
        updateAvatar,
        syncUser,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
