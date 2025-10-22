'use client';

import { assets, assessments as allAssessments } from '@/lib/data';
import { notFound, useRouter, useParams } from 'next/navigation';
import AssetDetails from '@/components/assets/asset-details';
import AssessmentForm from '@/components/assets/assessment-form';
import AssessmentHistory from '@/components/assets/assessment-history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getRole } from '@/lib/client-session';
import { useEffect, useState } from 'react';
import type { UserRole } from '@/lib/definitions';
import { ArrowLeft } from 'lucide-react';

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    getRole().then(setRole);
  }, []);

  const asset = assets.find((a) => a.id === id);
  const assessments = allAssessments.filter((a) => a.assetId === id);

  if (!asset) {
    notFound();
  }

  const canAssess = role === 'Administrator' || role === 'Manajer Aset';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">{asset.name}</h1>
            <p className="text-muted-foreground">Detail dan riwayat penilaian untuk aset: {asset.assetCode}</p>
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
              {role ? (
                canAssess ? (
                  <AssessmentForm asset={asset} />
                ) : (
                  <p className="text-muted-foreground">Anda tidak memiliki hak akses untuk melakukan penilaian.</p>
                )
              ) : (
                <p className="text-muted-foreground">Memuat...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
