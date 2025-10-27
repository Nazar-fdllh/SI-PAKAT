'use server';

import type { User, Role } from './definitions';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { initialRoles } from './data'; // Roles might still be needed if not in token

// This function now decodes the JWT to get user information
export async function getCurrentUser(): Promise<User | undefined> {
  const cookieStore = cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return undefined;

  try {
    // The secret must be a Uint8Array.
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'kunci-rahasia-yang-sangat-aman'
    );

    const { payload } = await jwtVerify(token, secret);

    // The payload from the backend JWT is expected to have this structure.
    // { id: 1, role: 'Administrator', name: 'Admin Utama', iat: ..., exp: ... }
    // We add a dummy email and avatarUrl to satisfy the frontend's User type.
    return {
      id: payload.id as number,
      name: payload.name as string,
      email: `${String(payload.name).toLowerCase().replace(' ', '.')}@sipakat.com`, // Create dummy email
      username: String(payload.name).toLowerCase().replace(' ', '.'),
      roleId: initialRoles.find(r => r.name === payload.role)?.id || 0,
      avatarUrl: `https://i.pravatar.cc/150?u=${payload.id}`,
    };
  } catch (e) {
    console.error('JWT verification failed:', e);
    // If token is invalid, treat as logged out
    return undefined;
  }
}

export async function getCurrentRole(): Promise<Role | null> {
    const user = await getCurrentUser();
    if (!user) return null;
    const role = initialRoles.find(r => r.id === user.roleId);
    return role || null;
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = cookies();
  return cookieStore.get('accessToken')?.value;
}
