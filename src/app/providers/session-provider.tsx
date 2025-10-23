'use client';

import type { User, Role } from '@/lib/definitions';
import { createContext, type ReactNode } from 'react';

// We also pass the role object for easier access to role name
export const SessionContext = createContext<{ user: User | null, role: Role | null }>({
  user: null,
  role: null,
});

export function SessionProvider({
  user,
  role,
  children,
}: {
  user: User;
  role: Role | null;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={{ user, role }}>
      {children}
    </SessionContext.Provider>
  );
}
