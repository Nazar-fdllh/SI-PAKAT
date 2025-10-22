import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-6 text-primary">
          <Shield className="h-8 w-8" />
          <span className="ml-2 text-2xl font-bold font-headline">SI-PAKAT Digital</span>
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Login</CardTitle>
            <CardDescription>Masuk ke akun Anda untuk melanjutkan</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
        <p className="px-8 text-center text-sm text-muted-foreground mt-4">
          Pendaftaran pengguna baru hanya dapat dilakukan oleh Administrator.
        </p>
      </div>
    </div>
  );
}
