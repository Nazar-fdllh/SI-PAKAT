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
  'g-recaptcha-response': z.string().min(1, 'CAPTCHA diperlukan.'),
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Kirim semua data yang tervalidasi, termasuk token captcha
        body: JSON.stringify(validatedFields.data),
      }
    );

    result = await response.json();

    if (!response.ok) {
      return {
        message:
          result.message ||
          'Login gagal. Periksa kembali email dan password Anda.',
      };
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      return {
        message:
          'Tidak dapat terhubung ke server backend. Pastikan server sudah berjalan.',
      };
    }
    console.error('Login error:', error);
    return { message: 'Terjadi kesalahan yang tidak diketahui.' };
  }

  // ✅ Gunakan await cookies()
  const cookieStore = await cookies();
  cookieStore.set('accessToken', result.accessToken, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 1 hari
    secure: process.env.NODE_ENV === 'production',
  });

  revalidatePath('/');
  redirect('/dashboard');
}

export async function logout() {
  // ✅ Gunakan await cookies()
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  redirect('/login');
}

export async function configureThresholds(
  data: ConfigureSecurityThresholdsInput
) {
  try {
    console.log('Configuring thresholds with data:', data);

    const result = await configureSecurityThresholds(data);

    // Revalidate settings path to show updated data if necessary
    revalidatePath('/settings');

    return { success: true, message: result.confirmationMessage };
  } catch (error) {
    console.error('Error configuring thresholds:', error);
    return { success: false, message: 'Gagal mengkonfigurasi ambang batas.' };
  }
}
