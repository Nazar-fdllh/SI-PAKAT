'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { User } from '@/lib/definitions';
import { initialRoles } from '@/lib/data';

const formSchema = z.object({
  name: z.string().min(3, 'Nama lengkap minimal 3 karakter.'),
  email: z.string().email('Email tidak valid.'),
  // Password is now optional. If provided, it must be at least 6 chars.
  password: z.string().min(6, 'Password minimal 6 karakter.').optional().or(z.literal('')),
  role_id: z.coerce.number({ required_error: 'Peran harus dipilih.' }),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  user: User | null;
  onSave: (user: Partial<User>) => void;
  onCancel: () => void;
}

export function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: user ? {
        name: user.name,
        email: user.email,
        password: '', // Always empty password field for editing
        role_id: initialRoles.find(r => r.name === user.role)?.id || 2,
    } : {
      name: '',
      email: '',
      password: '',
      role_id: 2, // Default to Manajer Aset
    },
  });

  function onSubmit(data: UserFormValues) {
    const payload: Partial<User> = {
      username: data.name, // The backend expects 'username'
      email: data.email,
      role_id: data.role_id,
    };
    if (data.password) {
        payload.password = data.password;
    }
    onSave(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="cth. Budi Sanjaya" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="cth. budi@sipakat.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder={user ? "Isi untuk mengubah password" : "******"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peran</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih peran pengguna" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {initialRoles.map(role => <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit">Simpan</Button>
        </div>
      </form>
    </Form>
  );
}