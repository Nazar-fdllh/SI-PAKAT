'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AssetForm } from './asset-form';
import AssetEditForm from './asset-edit-form';
import type { Asset, Classification, SubClassification } from '@/lib/definitions';
import { ScrollArea } from '../ui/scroll-area';

interface AssetDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (asset: Partial<Asset>) => void;
  asset: Asset | null;
  classifications: Classification[];
  subClassifications: SubClassification[];
  nextAssetCode?: string;
}

export function AssetDialog({ isOpen, onOpenChange, onSave, asset, classifications, subClassifications, nextAssetCode }: AssetDialogProps) {
  const isEditMode = asset !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {isEditMode ? 'Edit Aset' : 'Tambah Aset Baru'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Perbarui detail aset di bawah ini. Perubahan pada skor akan membuat catatan penilaian baru.' : 'Isi formulir untuk menambahkan aset baru dan melakukan penilaian awal.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4">
            {isEditMode ? (
              <AssetEditForm
                key={asset.id} // Key penting untuk re-render
                assetId={asset.id}
                classifications={classifications}
                subClassifications={subClassifications}
                onSave={onSave}
                onCancel={() => onOpenChange(false)}
              />
            ) : (
              <AssetForm
                classifications={classifications}
                subClassifications={subClassifications}
                onSave={onSave}
                onCancel={() => onOpenChange(false)}
                nextAssetCode={nextAssetCode}
              />
            )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
