'use client';

import { useSession } from '@/hooks/use-session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/components/profile/profile-form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user, role } = useSession();

  if (!user || !role) {
    return <div className="flex justify-center items-center h-full"><p>Memuat data pengguna...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Profil Saya</h1>
        <p className="text-muted-foreground">
          Kelola informasi akun dan preferensi Anda.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Informasi Akun</CardTitle>
          <CardDescription>Perbarui nama Anda. Email dan peran tidak dapat diubah.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center text-sm">
                <p className="text-muted-foreground">Nama</p>
                <p className="font-medium">{user.name}</p>
            </div>
             <div className="flex justify-between items-center text-sm">
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
            </div>
             <div className="flex justify-between items-center text-sm">
                <p className="text-muted-foreground">Peran</p>
                <Badge variant="outline">{role.name}</Badge>
            </div>
          </div>
          <Separator className="my-6" />
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
