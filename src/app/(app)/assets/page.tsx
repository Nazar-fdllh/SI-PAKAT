'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import AssetTable from '@/components/assets/asset-table';
import { initialAssets as staticAssets } from '@/lib/data';
import { getRole } from '@/lib/client-session';
import type { UserRole, Asset } from '@/lib/definitions';
import { AssetDialog } from '@/components/assets/asset-dialog';

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>(staticAssets);
  const [role, setRole] = useState<UserRole | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    getRole().then(setRole);
  }, []);

  const canManage = role === 'Administrator' || role === 'Manajer Aset';

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
        userRole={role}
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
