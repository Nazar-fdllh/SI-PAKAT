'use server';

import type { User, Role } from './definitions';
import { initialUsers, initialRoles } from './data';
import { cookies } from 'next/headers';


export async function getCurrentUser(): Promise<User | undefined> {
  const cookieStore = cookies();
  const emailCookie = cookieStore.get('user_email');

  const currentUserEmail = emailCookie?.value;

  if (!currentUserEmail) return undefined;
  
  const user = initialUsers.find(u => u.email === currentUserEmail);
  return user;
};

export async function getCurrentRole(): Promise<Role | null> {
    const user = await getCurrentUser();
    if (!user) return null;
    const role = initialRoles.find(r => r.id === user.roleId);
    return role || null;
}
