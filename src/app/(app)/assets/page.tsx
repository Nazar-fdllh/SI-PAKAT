'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import AssetTable from '@/components/assets/asset-table';
import { initialAssets as staticAssets } from '@/lib/data';
import type { Asset } from '@/lib/definitions';
import { AssetDialog } from '@/components/assets/asset-dialog';
import { useSession } from '@/hooks/use-session';

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>(staticAssets);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { user } = useSession();
  
  // Return null or a loading spinner if the user session is not yet available
  if (!user) {
    return <div className="flex justify-center items-center h-full"><p>Memuat data pengguna...</p></div>;
  }

  const canManage = user.role === 'Administrator' || user.role === 'Manajer Aset';

  const handleAddAsset = () => {
    setSelectedAsset(null);
    setDialogOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setDialogOpen(true);
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetId));
  };

  const handleSaveAsset = (assetData: Asset) => {
    if (selectedAsset) {
      // Update asset
      setAssets(prevAssets =>
        prevAssets.map(asset =>
          asset.id === assetData.id ? assetData : asset
        )
      );
    } else {
      // Add new asset
      const newAsset: Asset = {
        ...assetData,
        id: `ast_${Date.now()}`,
        assetCode: `HW-NEW-${Math.floor(Math.random() * 1000)}`,
      };
      setAssets(prevAssets => [newAsset, ...prevAssets]);
    }
    setDialogOpen(false);
    setSelectedAsset(null);
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
        userRole={user.role}
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
