
'use client';

import { useSession } from '@/hooks/use-session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileForm } from '@/components/profile/profile-form';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { user } = useSession();

  if (!user) {
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
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-2xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <Badge variant="outline" className="mt-2">{user.role}</Badge>
            </CardHeader>
          </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Informasi Akun</CardTitle>
                    <CardDescription>Perbarui nama Anda. Email tidak dapat diubah.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm user={user} />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
