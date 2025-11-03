'use server';

import type { User, Role } from './definitions';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Ambil token dari cookie (harus async sekarang)
export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies(); // ✅ gunakan await
  return cookieStore.get('accessToken')?.value;
}

// Decode JWT untuk ambil data user
export async function getCurrentUser(): Promise<User | undefined> {
  const token = await getAuthToken();
  if (!token) return undefined;

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'kunci-rahasia-yang-sangat-aman'
    );

    const { payload } = await jwtVerify(token, secret);

    const userName = (payload.name as string) || 'Pengguna';
    const userEmail = payload.email as string;
    const userRoleName = payload.role as
      | 'Administrator'
      | 'Manajer Aset'
      | 'Auditor';

    const roles: Role[] = [
      {
        id: 1,
        name: 'Administrator',
        description: 'Super user with all access',
      },
      { id: 2, name: 'Manajer Aset', description: 'Can manage assets' },
      {
        id: 3,
        name: 'Auditor',
        description: 'Can view assets and generate reports',
      },
    ];

    const roleDetails = roles.find((r) => r.name === userRoleName);

    return {
      id: payload.id as number,
      name: userName,
      username: userName,
      email: userEmail,
      role_id: roleDetails?.id || 0,
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

  const roles: Role[] = [
    {
      id: 1,
      name: 'Administrator',
      description: 'Super user with all access',
    },
    { id: 2, name: 'Manajer Aset', description: 'Can manage assets' },
    {
      id: 3,
      name: 'Auditor',
      description: 'Can view assets and generate reports',
    },
  ];

  return roles.find((r) => r.id === user.role_id) || null;
}
