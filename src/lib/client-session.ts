'use client'

import Cookies from 'js-cookie'
import type { UserRole } from './definitions'

export async function getRole(): Promise<UserRole | null> {
    return (Cookies.get('user_role') as UserRole) || null;
}
