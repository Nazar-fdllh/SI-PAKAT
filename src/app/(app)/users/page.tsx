import { redirect } from 'next/navigation';
import { getRole } from '@/lib/session';
import { users } from '@/lib/data';
import UserTable from '@/components/users/user-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default async function UsersPage() {
  const role = await getRole();
  if (role !== 'Administrator') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">
            Tambah, edit, atau hapus pengguna dan peran mereka.
          </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Pengguna
        </Button>
      </div>
      <UserTable initialUsers={users} />
    </div>
  );
}
