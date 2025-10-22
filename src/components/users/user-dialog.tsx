'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserForm } from './user-form';
import type { User } from '@/lib/definitions';

interface UserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (user: User) => void;
  user: User | null;
}

export function UserDialog({ isOpen, onOpenChange, onSave, user }: UserDialogProps) {
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
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
