'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from '@/lib/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Placeholder for ReCAPTCHA - This component needs to be implemented
const ReCAPTCHA = ({
  sitekey,
  onChange,
  onErrored,
  onExpired,
  reCaptchaRef,
}: {
  sitekey: string;
  onChange: (token: string | null) => void;
  onErrored: () => void;
  onExpired: () => void;
  reCaptchaRef: React.RefObject<any>;
}) => {
  // In a real app, you would use a library like 'react-google-recaptcha'
  // and pass the ref to it.
  useEffect(() => {
    console.warn("reCAPTCHA is not fully implemented. Please use a library like 'react-google-recaptcha'.");
  }, []);

  return (
    <div 
      ref={reCaptchaRef} 
      data-sitekey={sitekey}
      className="g-recaptcha p-2 border rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
      style={{ minHeight: '78px' }}
    >
      <p className="text-xs text-muted-foreground text-center">
        [reCAPTCHA v2 Checkbox Placeholder]
        <br />
        To implement, use 'react-google-recaptcha'.
      </p>
    </div>
  );
};


export function LoginForm() {
  const [state, dispatch] = useActionState(login, undefined);
  const reCaptchaRef = useRef<any>(null);
  const { toast } = useToast();

  const handleCaptchaChange = (token: string | null) => {
    // This function is called when reCAPTCHA is successfully completed.
    // The token would be added to the form data.
  };

  // This is a mock function to trigger form submission
  const handleSubmit = (formData: FormData) => {
    const recaptchaToken = "DUMMY_TOKEN_FOR_DEVELOPMENT"; // In production, this would come from the reCAPTCHA component
    
    // In a real implementation with react-google-recaptcha, you would get the token like this:
    // const recaptchaToken = reCaptchaRef.current?.getValue();
    // if (!recaptchaToken) {
    //   toast({
    //     variant: "destructive",
    //     title: "CAPTCHA Error",
    //     description: "Please complete the CAPTCHA verification.",
    //   });
    //   return;
    // }
    
    formData.append('g-recaptcha-response', recaptchaToken);
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
        NOTE: To enable reCAPTCHA:
        1. Install 'react-google-recaptcha' and its types: 
           `npm install react-google-recaptcha @types/react-google-recaptcha`
        2. Uncomment the component below and the script in `layout.tsx`.
        3. Provide your Site Key from Google reCAPTCHA admin console.
      */}
      {/* <ReCAPTCHA
        reCaptchaRef={reCaptchaRef}
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
        onChange={handleCaptchaChange}
        onErrored={() => toast({ variant: "destructive", title: "CAPTCHA Load Error" })}
        onExpired={() => toast({ variant: "destructive", title: "CAPTCHA Expired" })}
      /> */}

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
