'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { users } from './data';
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

  const { email } = validatedFields.data;
  const user = users.find((u) => u.email === email);

  if (!user) {
    return {
      message: 'Email atau password salah.',
    };
  }

  // In a real app, you would verify the password here.
  // For this demo, we'll set the user's email in a cookie.
  cookies().set('user_email', user.email, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  redirect('/dashboard');
}

export async function logout() {
  cookies().delete('user_email');
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
