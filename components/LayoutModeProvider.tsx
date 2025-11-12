'use client';
import React, { createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';

type LayoutMode = {
  hero: boolean; // true on homepage
};

const LayoutModeContext = createContext<LayoutMode>({ hero: false });

export function LayoutModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hero = pathname === '/';
  return (
    <LayoutModeContext.Provider value={{ hero }}>
      {children}
    </LayoutModeContext.Provider>
  );
}

export function useLayoutMode() {
  return useContext(LayoutModeContext);
}
