
'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Shield, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { resetPassword } from '@/lib/data';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Menyimpan...' : 'Reset Password'}
    </Button>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!password || !confirmPassword) {
      setMessage({ type: 'error', text: 'Semua field harus diisi.' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Password dan konfirmasi password tidak cocok.' });
      return;
    }
    if (!token) {
        setMessage({ type: 'error', text: 'Token reset tidak valid atau tidak ditemukan.'});
        return;
    }

    try {
      const result = await resetPassword({ token, password });
      setMessage({ type: 'success', text: result.message });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.' });
    }
  };

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="flex items-center justify-center mb-6 text-primary">
        <Shield className="h-8 w-8" />
        <span className="ml-2 text-2xl font-bold font-headline">SI-PAKAT</span>
      </Link>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Reset Password</CardTitle>
          <CardDescription>Masukkan password baru Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <Alert variant="destructive">
              <AlertTitle>Token Tidak Ditemukan</AlertTitle>
              <AlertDescription>Link reset password tidak valid atau telah kedaluwarsa.</AlertDescription>
            </Alert>
          ) : message?.type === 'success' ? (
             <Alert variant="default" className="bg-green-100 dark:bg-green-900/30 border-green-400 text-green-800 dark:text-green-300 [&>svg]:text-green-500">
                <AlertTitle>Sukses</AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
             </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password Baru</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password baru"
                    required
                    className="pl-10"
                  />
                   <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ulangi password baru"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              {message && message.type === 'error' && (
                <Alert variant="destructive">
                  <AlertTitle>Gagal</AlertTitle>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <SubmitButton />
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Link href="/login" passHref className="w-full">
            <Button variant="link" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}


export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
                <ResetPasswordForm />
            </div>
        </Suspense>
    )
}
