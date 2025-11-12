
'use client';

import { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from '@/lib/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReCAPTCHA from 'react-google-recaptcha';

export function LoginForm() {
  const [state, dispatch] = useActionState(login, undefined);
  const reCaptchaRef = useRef<ReCAPTCHA>(null);
  const { toast } = useToast();

  const handleCaptchaChange = (token: string | null) => {
    // This function is called when reCAPTCHA is successfully completed.
    // The token is automatically handled by the form submission logic.
  };

  const handleSubmit = (formData: FormData) => {
    // For production, we get the token from the reCAPTCHA component
    const recaptchaToken = reCaptchaRef.current?.getValue();
    
    // In development, if the key is a dummy key, we can bypass the check
    const isDevelopment = process.env.NODE_ENV === 'development';
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
    const isDummyKey = siteKey.includes('dummy-site-key');
    
    if (!recaptchaToken && !(isDevelopment && isDummyKey)) {
       toast({
         variant: "destructive",
         title: "Verifikasi Gagal",
         description: "Harap selesaikan verifikasi CAPTCHA.",
       });
       return;
    }

    // If using dummy token for dev, provide it. Otherwise, use the real one.
    const tokenToSend = (isDevelopment && isDummyKey) ? "DUMMY_TOKEN_FOR_DEVELOPMENT" : recaptchaToken;
    
    formData.append('g-recaptcha-response', tokenToSend!);
    dispatch(formData);
  };


  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Masukkan Email Anda"
          required
        />
        {state?.errors?.email && (
          <p className="text-sm text-destructive">{state.errors.email}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
        id="password" 
        name="password" 
        type="password"
        placeholder="Masukkan Password Anda" 
        required />
        {state?.errors?.password && (
          <p className="text-sm text-destructive">{state.errors.password}</p>
        )}
      </div>
      
      {/* 
        NOTE: To enable reCAPTCHA for real:
        1. Get keys from Google reCAPTCHA admin console.
        2. Provide your Site Key in .env.local:
           NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
        3. Provide your Secret Key in your backend's .env file.
      */}
      <ReCAPTCHA
        ref={reCaptchaRef}
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'dummy-site-key-for-testing'}
        onChange={handleCaptchaChange}
        onErrored={() => toast({ variant: "destructive", title: "CAPTCHA Gagal Dimuat" })}
        onExpired={() => toast({ variant: "destructive", title: "Verifikasi CAPTCHA Kedaluwarsa" })}
      />

      {state?.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Login Gagal</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <LoginButton />
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Memproses...' : 'Login'}
    </Button>
  );
}
