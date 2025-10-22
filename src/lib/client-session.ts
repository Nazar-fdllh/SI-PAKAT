'use client'

import Cookies from 'js-cookie'
import type { UserRole } from './definitions'
import { initialUsers } from './data';

// This is a simplified client-side session retrieval.
// In a real app, you might want to fetch user data from an API endpoint
// that verifies the session cookie.

async function getEmail(): Promise<string | null> {
    return Cookies.get('user_email') || null;
}

export async function getRole(): Promise<UserRole | null> {
    const email = await getEmail();
    if (!email) return null;
    const user = initialUsers.find(u => u.email === email);
    return user?.role || null;
}
