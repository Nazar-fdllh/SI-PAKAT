import { redirect } from 'next/navigation';
import { getRole } from '@/lib/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThresholdForm } from '@/components/settings/threshold-form';

export default async function SettingsPage() {
  const role = await getRole();
  if (role !== 'Administrator') {
    redirect('/dashboard');
  }

  // In a real app, you would fetch these initial values from your database
  const currentSettings = {
    highThreshold: 11,
    mediumThreshold: 6,
    lowThreshold: 5,
    highDescription: "Aset kritikal yang dampaknya sangat besar jika terganggu.",
    mediumDescription: "Aset penting yang mendukung operasional bisnis utama.",
    lowDescription: "Aset pendukung dengan dampak operasional yang rendah.",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Pengaturan Sistem</h1>
        <p className="text-muted-foreground">
          Konfigurasi data master dan parameter sistem.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className='font-headline'>Ambang Batas Klasifikasi Aset</CardTitle>
          <CardDescription>
            Atur rentang skor untuk menentukan klasifikasi nilai aset (Tinggi, Sedang, Rendah).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThresholdForm currentSettings={currentSettings} />
        </CardContent>
      </Card>
    </div>
  );
}
