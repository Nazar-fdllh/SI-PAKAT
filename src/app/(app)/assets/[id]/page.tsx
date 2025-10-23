'use client';

import { getEnrichedAssets, initialAssessments, initialUsers } from '@/lib/data';
import { notFound, useRouter, useParams } from 'next/navigation';
import AssetDetails from '@/components/assets/asset-details';
import AssessmentForm from '@/components/assets/assessment-form';
import AssessmentHistory from '@/components/assets/assessment-history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSession } from '@/hooks/use-session';
import { useMemo } from 'react';

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, role } = useSession();

  const asset = useMemo(() => getEnrichedAssets().find((a) => a.id === parseInt(id)), [id]);
  const assessments = useMemo(() => initialAssessments.filter((a) => a.asset_id === parseInt(id)), [id]);
  
  if (!asset) {
    notFound();
  }
  
  if (!user || !role) {
    return <div className="flex justify-center items-center h-full"><p>Memuat data pengguna...</p></div>;
  }

  const canAssess = role.name === 'Administrator' || role.name === 'Manajer Aset';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">{asset.asset_name}</h1>
            <p className="text-muted-foreground">Detail dan riwayat penilaian untuk aset: {asset.asset_code}</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Detail Aset</CardTitle>
            </CardHeader>
            <CardContent>
              <AssetDetails asset={asset} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Riwayat Penilaian</CardTitle>
            </CardHeader>
            <CardContent>
              <AssessmentHistory assessments={assessments} />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Penilaian Keamanan</CardTitle>
            </CardHeader>
            <CardContent>
              {canAssess ? (
                <AssessmentForm asset={asset} />
              ) : (
                <p className="text-muted-foreground">Anda tidak memiliki hak akses untuk melakukan penilaian.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
