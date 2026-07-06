'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ServerUser } from '../../services/serverDb';

interface DashboardContextType {
  xp: number;
  level: number;
  streak: number;
  displayName: string;
  updateStats: (newXp: number, newLevel: number, newStreak: number) => void;
  updateDisplayName: (newName: string) => void;
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

  const updateStats = (newXp: number, newLevel: number, newStreak: number) => {
    setXp(newXp);
    setLevel(newLevel);
    setStreak(newStreak);
  };

  const updateDisplayName = (newName: string) => {
    setDisplayName(newName);
  };

  const syncUser = (user: ServerUser) => {
    setXp(user.xp);
    setLevel(user.level);
    setStreak(user.streak);
    setDisplayName(user.displayName);
  };

  return (
    <DashboardContext.Provider
      value={{
        xp,
        level,
        streak,
        displayName,
        updateStats,
        updateDisplayName,
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
