'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/lib/data';
import UserTable from '@/components/users/user-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { UserDialog } from '@/components/users/user-dialog';
import type { User } from '@/lib/definitions';
import { useSession } from '@/hooks/use-session';
import { toast } from '@/hooks/use-toast';

export default function UsersPage() {
  const router = useRouter();
  const { role } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Gagal Memuat Pengguna',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (role && role.name !== 'Administrator') {
      router.push('/dashboard');
    }
    if (role && role.name === 'Administrator') {
      fetchUsers();
    }
  }, [role, router]);

  if (!role) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Memuat atau mengalihkan...</p>
      </div>
    );
  }

  if (role.name !== 'Administrator') {
    return null;
  }

  const handleAddUser = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId);
      toast({
        title: 'Pengguna Dihapus',
        description: 'Pengguna telah berhasil dihapus.'
      });
      fetchUsers();
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Gagal Menghapus',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan.',
      });
    }
  };

  const handleSaveUser = async (userData: Partial<User>) => {
     try {
      if (selectedUser) {
        // The API expects 'username', not 'name'
        const payload = { ...userData, username: userData.name };
        delete payload.name;
        await updateUser(selectedUser.id, payload);
        toast({ title: 'Pengguna Diperbarui' });
      } else {
        const payload = { ...userData, username: userData.name };
        delete payload.name;
        await createUser(payload);
        toast({ title: 'Pengguna Dibuat' });
      }
      setDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">
            Tambah, edit, atau hapus pengguna dan peran mereka.
          </p>
        </div>
        <Button onClick={handleAddUser}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>
      <UserTable
        users={users}
        isLoading={isLoading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
      <UserDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveUser}
        user={selectedUser}
      />
    </div>
  );
}