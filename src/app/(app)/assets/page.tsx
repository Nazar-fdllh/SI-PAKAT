'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import AssetTable from '@/components/assets/asset-table';
import { getAllAssets, createAsset, updateAsset, deleteAsset } from '@/lib/data';
import type { Asset } from '@/lib/definitions';
import { AssetDialog } from '@/components/assets/asset-dialog';
import { useSession } from '@/hooks/use-session';
import { toast } from '@/hooks/use-toast';

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { user, role } = useSession();

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const data = await getAllAssets();
      setAssets(data);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Gagal Memuat Aset',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (role) {
        fetchAssets();
    }
  }, [role]);
  
  if (!user || !role) {
    return <div className="flex justify-center items-center h-full"><p>Memuat data pengguna...</p></div>;
  }

  const canManage = role.name === 'Administrator' || role.name === 'Manajer Aset';

  const handleAddAsset = () => {
    setSelectedAsset(null);
    setDialogOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setDialogOpen(true);
  };

  const handleDeleteAsset = async (assetId: number) => {
    try {
      await deleteAsset(assetId);
      toast({
        title: 'Aset Dihapus',
        description: 'Aset telah berhasil dihapus dari sistem.',
      });
      fetchAssets(); // Refresh data
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Gagal Menghapus Aset',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.',
      });
    }
  };

  const handleSaveAsset = async (assetData: Partial<Asset>) => {
    try {
      if (selectedAsset) {
        await updateAsset(selectedAsset.id, assetData);
        toast({
          title: 'Aset Diperbarui',
          description: 'Detail aset telah berhasil diperbarui.',
        });
      } else {
        await createAsset(assetData);
        toast({
          title: 'Aset Ditambahkan',
          description: 'Aset baru telah berhasil ditambahkan.',
        });
      }
      setDialogOpen(false);
      setSelectedAsset(null);
      fetchAssets(); // Refresh data
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan Aset',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Inventaris Aset</h1>
          <p className="text-muted-foreground">
            Kelola dan pantau semua aset TIK di organisasi Anda.
          </p>
        </div>
        {canManage && (
          <Button onClick={handleAddAsset}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Aset
          </Button>
        )}
      </div>

      <AssetTable
        assets={assets}
        isLoading={isLoading}
        userRole={role.name}
        onEdit={handleEditAsset}
        onDelete={handleDeleteAsset}
      />

      <AssetDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveAsset}
        asset={selectedAsset}
      />
    </div>
  );
}