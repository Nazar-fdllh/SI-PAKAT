'use client';

import { getAssetById, updateAsset } from '@/lib/data';
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
      // Use the simplified getAssetById function with the getDetails flag
      const assetData = await getAssetById(id, true);
      if (!assetData) {
        notFound();
        return;
      }
      setAsset(assetData);
      
      // Jika backend mengirimkan riwayat penilaian, kita bisa menampilkannya.
      // Untuk saat ini, kita buat tiruan berdasarkan data penilaian terakhir.
      if (assetData.total_score !== null && assetData.total_score !== undefined) {
         const latestAssessment: Assessment = {
            id: -1, // ID sementara
            asset_id: assetData.id,
            assessed_by: -1, 
            assessed_by_name: 'Penilaian Terakhir',
            assessment_date: new Date().toISOString(), // Tanggal sementara
            asset_value: assetData.asset_value || 'Rendah',
            total_score: assetData.total_score,
            confidentiality_score: assetData.confidentiality_score || 1,
            integrity_score: assetData.integrity_score || 1,
            availability_score: assetData.availability_score || 1,
            authenticity_score: assetData.authenticity_score || 1,
            non_repudiation_score: assetData.non_repudiation_score || 1,
        };
        // Idealnya, backend akan mengirimkan array riwayat penilaian.
        setAssessments([latestAssessment]);
      } else {
        setAssessments([]); // Tidak ada data penilaian
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const handleNewAssessment = async (assessmentData: Partial<Assessment>) => {
    if (!asset || !user) return;

    // Perbaikan: Hanya kirim data penilaian baru dan ID pengguna.
    // Backend akan menggunakan data ini untuk membuat catatan penilaian baru,
    // tanpa perlu mengirim ulang semua data aset yang bisa menyebabkan error validasi.
    const payload: Partial<Assessment> = {
      ...assessmentData,
      assessed_by: user.id,
      notes: 'Penilaian baru ditambahkan melalui halaman detail.',
    };
    
    try {
      // Endpoint PUT di backend cukup pintar untuk menangani payload yang hanya berisi skor.
      await updateAsset(asset.id, payload);
      toast({
        title: 'Penilaian Disimpan',
        description: 'Penilaian baru untuk aset telah berhasil disimpan.',
      });
      // Ambil ulang data untuk mendapatkan state terbaru.
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
                  // Kirim skor aktual dari aset yang diambil ke formulir.
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
