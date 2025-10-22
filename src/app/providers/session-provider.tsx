'use client';

import type { User } from '@/lib/definitions';
import { createContext, type ReactNode } from 'react';

export const SessionContext = createContext<{ user: User | null }>({
  user: null,
});

export function SessionProvider({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={{ user }}>
      {children}
    </SessionContext.Provider>
  );
}
