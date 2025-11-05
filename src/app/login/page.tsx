import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-6 text-primary">
          <Shield className="h-8 w-8" />
          <span className="ml-2 text-2xl font-bold font-headline">SI-PAKAT</span>
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Login</CardTitle>
            <CardDescription>Masuk ke akun Anda untuk melanjutkan</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              Penambahan akun hanya bisa dilakukan oleh Administrator.
            </p>
          </CardFooter>
        </Card>
        <div className="mt-4 text-center">
            <Link href="/" passHref>
                <Button variant="link">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Halaman Utama
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
}
