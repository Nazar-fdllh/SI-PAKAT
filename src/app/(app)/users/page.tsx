'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initialUsers } from '@/lib/data';
import UserTable from '@/components/users/user-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { UserDialog } from '@/components/users/user-dialog';
import type { User } from '@/lib/definitions';
import { useSession } from '@/hooks/use-session';

export default function UsersPage() {
  const router = useRouter();
  const { user } = useSession();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // Redirect if user data is loaded and the user is not an administrator
    if (user && user.role !== 'Administrator') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Show a loading state while user data is being fetched
  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Memuat atau mengalihkan...</p>
      </div>
    );
  }

  // If the user is not an administrator, they will be redirected, so we can return null here.
  if (user.role !== 'Administrator') {
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

  const handleDeleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  const handleSaveUser = (userData: User) => {
    if (selectedUser) {
      // Update user
      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === userData.id ? userData : user))
      );
    } else {
      // Add new user
      const newUser: User = {
        ...userData,
        id: `usr_${Date.now()}`,
        avatarUrl: `https://i.pravatar.cc/150?u=${userData.email}`,
      };
      setUsers(prevUsers => [newUser, ...prevUsers]);
    }
    setDialogOpen(false);
    setSelectedUser(null);
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
