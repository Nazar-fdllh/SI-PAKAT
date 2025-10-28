'use server';

import type { User, Role } from './definitions';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { initialRoles } from './data'; // Roles might still be needed if not in token

// This function now decodes the JWT to get user information
export async function getCurrentUser(): Promise<User | undefined> {
  const token = cookies().get('accessToken')?.value;

  if (!token) return undefined;

  try {
    // The secret must be a Uint8Array.
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'kunci-rahasia-yang-sangat-aman'
    );

    const { payload } = await jwtVerify(token, secret);

    // The payload from the backend JWT is expected to have this structure.
    // { id: 1, role: 'Administrator', name: 'Admin Utama', iat: ..., exp: ... }
    
    // The backend's "name" property is the user's full name.
    // We map it to `name` for frontend consistency.
    const userName = (payload.name as string) || 'Pengguna';
    const userEmail = payload.email as string || `${userName.toLowerCase().replace(/ /g, '.')}@sipakat.com`;

    return {
      id: payload.id as number,
      name: userName, // Use the name from the token
      username: userName, // Backend uses `username` field for the name
      email: userEmail,
      role_id: initialRoles.find(r => r.name === payload.role)?.id || 0,
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
    if (!user || !user.role_id) return null;
    const role = initialRoles.find(r => r.id === user.role_id);
    return role || null;
}
