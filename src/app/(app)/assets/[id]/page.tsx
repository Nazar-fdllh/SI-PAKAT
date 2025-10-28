'use client';

import { getAssetById, getAssessmentsForAsset, updateAsset } from '@/lib/data';
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

  const fetchAssetData = async () => {
    if (!id || !user) return;
    setIsLoading(true);
    try {
      const assetData = await getAssetById(id);
      if (!assetData) {
        notFound();
        return;
      }
      setAsset(assetData);
      
      // Since the main endpoint now returns the latest assessment, we use it.
      // The separate history endpoint is still prepared for future use.
      if (assetData.total_score !== undefined) {
         const latestAssessment = {
            id: -1, // Placeholder ID
            asset_id: assetData.id,
            assessed_by: user.id, // Placeholder
            assessed_by_name: 'Penilaian Terakhir',
            assessment_date: new Date().toISOString(), // Placeholder
            asset_value: assetData.asset_value,
            total_score: assetData.total_score,
            confidentiality_score: assetData.confidentiality_score,
            integrity_score: assetData.integrity_score,
            availability_score: assetData.availability_score,
            authenticity_score: assetData.authenticity_score,
            non_repudiation_score: assetData.non_repudiation_score,
        };
        // In a real scenario with a history endpoint, you would fetch and merge
        // const assessmentData = await getAssessmentsForAsset(parseInt(id));
        setAssessments([latestAssessment as Assessment]);
      }

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

  useEffect(() => {
    fetchAssetData();
  }, [id, user]);

  const handleNewAssessment = async (assessmentData: Partial<Assessment>) => {
    if (!asset || !user) return;

    const payload = {
        // We only send the new scores and who assessed it
        ...assessmentData,
        assessed_by: user.id,
        // Include base asset data that PUT endpoint might expect
        asset_code: asset.asset_code,
        asset_name: asset.asset_name,
        classification_id: asset.classification_id,
        sub_classification_id: asset.sub_classification_id,
        identification_of_existence: asset.identification_of_existence,
        location: asset.location,
        owner: asset.owner,
    };
    
    try {
      await updateAsset(asset.id, payload as Partial<Asset>);
      toast({
        title: 'Penilaian Disimpan',
        description: 'Penilaian baru untuk aset telah berhasil disimpan.',
      });
      // Refetch all data to get the latest state
      fetchAssetData();
    } catch (error) {
      console.error("Failed to save new assessment:", error);
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan Penilaian',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.',
      });
    }
  };
  
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
              <CardTitle className="font-headline">Perbarui Penilaian Keamanan</CardTitle>
            </CardHeader>
            <CardContent>
              {canAssess ? (
                <AssessmentForm 
                  initialScores={{
                    confidentiality_score: asset.confidentiality_score,
                    integrity_score: asset.integrity_score,
                    availability_score: asset.availability_score,
                    authenticity_score: asset.authenticity_score,
                    non_repudiation_score: asset.non_repudiation_score,
                  }}
                  onSave={handleNewAssessment}
                />
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
