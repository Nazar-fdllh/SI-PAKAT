'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  configureSecurityThresholds,
  type ConfigureSecurityThresholdsInput,
} from '@/ai/flows/configure-security-thresholds';
import { revalidatePath } from 'next/cache';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid.'),
  password: z.string().min(1, 'Password tidak boleh kosong.'),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  let result;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedFields.data),
    });

    result = await response.json();

    if (!response.ok) {
      return { message: result.message || 'Login gagal. Periksa kembali email dan password Anda.' };
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      return { message: 'Tidak dapat terhubung ke server backend. Pastikan server sudah berjalan.' };
    }
    console.error('Login error:', error);
    return { message: 'Terjadi kesalahan yang tidak diketahui.' };
  }

  // Simpan token ke cookie
  cookies().set('accessToken', result.accessToken, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 1 hari, sesuaikan dengan backend
    secure: process.env.NODE_ENV === 'production',
  });

  // Redirect should be called outside of try...catch
  // because it throws an error to stop execution and redirect.
  revalidatePath('/');
  redirect('/dashboard');
}


export async function logout() {
  cookies().delete('accessToken');
  redirect('/login');
}


export async function configureThresholds(data: ConfigureSecurityThresholdsInput) {
  try {
    // Here you would typically save the thresholds to your database.
    // For this demo, we are just calling the AI flow to get a confirmation.
    
    console.log("Configuring thresholds with data:", data);

    const result = await configureSecurityThresholds(data);

    // Revalidate the settings path to show updated data if necessary
    revalidatePath('/settings');
    
    return { success: true, message: result.confirmationMessage };
  } catch (error) {
    console.error("Error configuring thresholds:", error);
    return { success: false, message: "Gagal mengkonfigurasi ambang batas." };
  }
}
