'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserForm } from './user-form';
import type { User, Role } from '@/lib/definitions';

interface UserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (user: User) => void;
  user: User | null;
  roles: Role[]; // Roles are now passed as a prop
}

export function UserDialog({ isOpen, onOpenChange, onSave, user, roles }: UserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {user ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'Perbarui detail pengguna di bawah ini.' : 'Isi formulir untuk menambahkan pengguna baru.'}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          user={user}
          roles={roles} // Pass roles to the form
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
