'use server';

import type { User, Role } from './definitions';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { initialRoles } from './data';

// This function now decodes the JWT to get user information
export async function getCurrentUser(): Promise<User | undefined> {
  const token = cookies().get('accessToken')?.value;

  if (!token) return undefined;

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'kunci-rahasia-yang-sangat-aman'
    );

    const { payload } = await jwtVerify(token, secret);
    
    const userName = (payload.name as string) || 'Pengguna';
    const userEmail = payload.email as string || `${userName.toLowerCase().replace(/ /g, '.')}@sipakat.com`;

    return {
      id: payload.id as number,
      name: userName,
      username: userName,
      email: userEmail,
      role_id: initialRoles.find(r => r.name === payload.role)?.id || 0,
      avatarUrl: `https://i.pravatar.cc/150?u=${payload.id}`,
    };
  } catch (e) {
    console.error('JWT verification failed:', e);
    return undefined;
  }
}

export async function getCurrentRole(): Promise<Role | null> {
    const user = await getCurrentUser();
    if (!user || !user.role_id) return null;
    const role = initialRoles.find(r => r.id === user.role_id);
    return role || null;
}

// This is a server-only function to get the raw token
export function getAuthToken(): string | undefined {
  return cookies().get('accessToken')?.value;
}
