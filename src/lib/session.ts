'use server';

import type { User, UserRole } from './definitions';
import { users } from './data';
import { cookies } from 'next/headers';


export async function getCurrentUser(): Promise<User | undefined> {
  const cookieStore = cookies();
  const emailCookie = cookieStore.get('user_email');

  const currentUserEmail = emailCookie?.value;

  if (!currentUserEmail) return undefined;
  
  const user = users.find(u => u.email === currentUserEmail);
  return user;
};

export async function getRole(): Promise<UserRole | null> {
    const user = await getCurrentUser();
    return user?.role || null;
}
