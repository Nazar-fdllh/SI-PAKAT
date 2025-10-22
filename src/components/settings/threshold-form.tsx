'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { configureThresholds } from '@/lib/actions';
import type { ConfigureSecurityThresholdsInput } from '@/ai/flows/configure-security-thresholds';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const formSchema = z.object({
  highThreshold: z.coerce.number().min(1, 'Harus lebih dari 0'),
  mediumThreshold: z.coerce.number().min(1, 'Harus lebih dari 0'),
  lowThreshold: z.coerce.number().min(1, 'Harus lebih dari 0'),
  highDescription: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
  mediumDescription: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
  lowDescription: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
});

type ThresholdFormProps = {
    currentSettings: ConfigureSecurityThresholdsInput;
}

export function ThresholdForm({ currentSettings }: ThresholdFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: currentSettings,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await configureThresholds(values);

    if (result.success) {
      toast({
        title: 'Konfigurasi Berhasil',
        description: result.message,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Konfigurasi Gagal',
        description: result.message,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
          <FormField
            control={form.control}
            name="highThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ambang Batas Tinggi (Nilai &gt;=)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mediumThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ambang Batas Sedang (Nilai &gt;=)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="lowThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ambang Batas Rendah (Nilai &lt;)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                 <FormDescription>
                    Nilai di bawah ini akan dianggap 'Rendah'.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
            <FormField
            control={form.control}
            name="highDescription"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Deskripsi Klasifikasi Tinggi</FormLabel>
                <FormControl>
                    <Textarea className='min-h-[120px]' {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="mediumDescription"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Deskripsi Klasifikasi Sedang</FormLabel>
                <FormControl>
                    <Textarea className='min-h-[120px]' {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="lowDescription"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Deskripsi Klasifikasi Rendah</FormLabel>
                <FormControl>
                    <Textarea className='min-h-[120px]' {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Konfigurasi"}
        </Button>
      </form>
    </Form>
  );
}
