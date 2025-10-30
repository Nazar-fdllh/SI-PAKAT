'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllUsers, createUser, updateUser, deleteUser, getAllRoles } from '@/lib/data';
import UserTable from '@/components/users/user-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { UserDialog } from '@/components/users/user-dialog';
import type { User, Role } from '@/lib/definitions';
import { useSession } from '@/hooks/use-session';
import { toast } from '@/hooks/use-toast';

export default function UsersPage() {
  const router = useRouter();
  const { user: sessionUser, role } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch users and roles in parallel
      const [usersData, rolesData] = await Promise.all([
        getAllUsers(),
        getAllRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Gagal Memuat Data',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat pengguna dan peran.',
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
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
     if (sessionUser?.id === userId) {
      toast({
        variant: 'destructive',
        title: 'Aksi Ditolak',
        description: 'Anda tidak dapat menghapus akun Anda sendiri.',
      });
      return;
    }
    try {
      await deleteUser(userId);
      toast({
        title: 'Pengguna Dihapus',
        description: 'Pengguna telah berhasil dihapus.'
      });
      fetchData(); // Refetch data
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
      // The API expects 'username' for the name field.
      const payload: Partial<User> & { username?: string } = {
        ...userData,
        username: userData.name, // Map frontend 'name' to backend 'username'
      };
      delete payload.name; // Clean up frontend-only property

      if (selectedUser) {
        await updateUser(selectedUser.id, payload);
        toast({ title: 'Pengguna Diperbarui' });
      } else {
        await createUser(payload);
        toast({ title: 'Pengguna Dibuat' });
      }
      setDialogOpen(false);
      setSelectedUser(null);
      fetchData(); // Refetch data
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
        currentUser={sessionUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
      {roles.length > 0 && (
        <UserDialog
          isOpen={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveUser}
          user={selectedUser}
          roles={roles}
        />
      )}
    </div>
  );
}
