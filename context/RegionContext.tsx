import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Region = 'EG' | 'WORLDWIDE';

interface RegionContextValue {
  region: Region;
  setRegion: (region: Region) => void;
}

const RegionContext = createContext<RegionContextValue | null>(null);

const STORAGE_KEY = 'novara_region';

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [region, setRegionState] = useState<Region>('EG');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'EG' || saved === 'WORLDWIDE') setRegionState(saved);
    } catch {
      // ignore
    }
  }, []);

  const setRegion = useCallback((next: Region) => {
    setRegionState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(() => ({ region, setRegion }), [region, setRegion]);

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
};

export function useRegion(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within a RegionProvider');
  return ctx;
}

