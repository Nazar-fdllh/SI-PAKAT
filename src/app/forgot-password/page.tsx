
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { forgotPassword } from '@/lib/data';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Mengirim...' : 'Kirim Link Reset Password'}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;

    if (!email) {
      setMessage({ type: 'error', text: 'Email harus diisi.' });
      return;
    }

    try {
      const result = await forgotPassword({ email });
      setMessage({ type: 'success', text: result.message });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-6 text-primary">
          <Shield className="h-8 w-8" />
          <span className="ml-2 text-2xl font-bold font-headline">SI-PAKAT</span>
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Lupa Password</CardTitle>
            <CardDescription>Masukkan email Anda untuk menerima link reset password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    required
                    className="pl-10"
                    />
                </div>
              </div>

              {message && (
                <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 border-green-400 text-green-800 dark:text-green-300 [&>svg]:text-green-500' : ''}>
                  <AlertTitle>{message.type === 'error' ? 'Gagal' : 'Sukses'}</AlertTitle>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <SubmitButton />
            </form>
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
    </div>
  );
}
