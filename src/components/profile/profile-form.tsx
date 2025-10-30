
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
import { toast } from '@/hooks/use-toast';
import type { User } from '@/lib/definitions';
import { updateUser } from '@/lib/data';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter.'),
});

type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: user.name,
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      const payload: Partial<User> & { username?: string } = {
        email: user.email, // Sertakan email agar validasi backend tidak gagal
        role_id: user.role_id, // Sertakan role_id agar validasi backend tidak gagal
        username: data.name, // API backend mengharapkan 'username'
      };

      await updateUser(user.id, payload);
      
      toast({
        title: 'Profil Diperbarui',
        description: 'Informasi profil Anda telah berhasil disimpan.',
      });

      // Reload the page or re-fetch data to reflect changes
      // A simple way is to refresh the page
      router.refresh();

    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Memperbarui Profil',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Perbarui Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Nama lengkap Anda" {...field} />
              </FormControl>
              <FormDescription>
                Hanya nama yang dapat diubah melalui halaman ini.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
