'use client';

import { getAssetById, getAssessmentsForAsset } from '@/lib/data';
import { notFound, useRouter, useParams } from 'next/navigation';
import AssetDetails from '@/components/assets/asset-details';
import AssessmentForm from '@/components/assets/assessment-form';
import AssessmentHistory from '@/components/assets/assessment-history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSession } from '@/hooks/use-session';
import { useEffect, useState } from 'react';
import type { Asset, Assessment } from '@/lib/definitions';
import { toast } from '@/hooks/use-toast';

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, role } = useSession();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const assetData = await getAssetById(id);
          if (!assetData) {
            notFound();
            return;
          }
          setAsset(assetData);
          const assessmentData = await getAssessmentsForAsset(parseInt(id));
          setAssessments(assessmentData);
        } catch (error) {
          console.error("Failed to fetch asset details:", error);
          toast({
            variant: 'destructive',
            title: 'Gagal Memuat Detail Aset',
            description: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.'
          });
          notFound();
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [id, user]);
  
  if (isLoading || !asset) {
    return <div className="flex justify-center items-center h-full"><p>Memuat data aset...</p></div>;
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
