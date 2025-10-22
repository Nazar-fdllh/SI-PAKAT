// In a real app, this would be handled by your auth provider.
// For this demo, we'll use a simple object to simulate the session.
// You can change the role here to test different user views.
import type { User, UserRole } from './definitions';
import { users } from './data';
import { cookies } from 'next/headers';

const session = {
  // Options: 'Administrator', 'Manajer Aset', 'Auditor/Pimpinan'
  role: 'Administrator' as UserRole,
};

export async function getCurrentUser(): Promise<User | undefined> {
  const cookieStore = cookies();
  const roleCookie = cookieStore.get('user_role');

  const currentRole = (roleCookie?.value as UserRole);

  if (!currentRole) return undefined;
  
  const user = users.find(u => u.role === currentRole);
  return user;
};

export async function getRole(): Promise<UserRole | null> {
    const user = await getCurrentUser();
    return user?.role || null;
}
