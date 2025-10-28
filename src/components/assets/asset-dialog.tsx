'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AssetForm } from './asset-form';
import type { Asset, Classification, SubClassification } from '@/lib/definitions';
import { ScrollArea } from '../ui/scroll-area';

interface AssetDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (asset: Partial<Asset>) => void;
  asset: Asset | null;
  classifications: Classification[];
  subClassifications: SubClassification[];
}

export function AssetDialog({ isOpen, onOpenChange, onSave, asset, classifications, subClassifications }: AssetDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {asset ? 'Edit Aset' : 'Tambah Aset Baru'}
          </DialogTitle>
          <DialogDescription>
            {asset ? 'Perbarui detail aset dan penilaiannya di bawah ini.' : 'Isi formulir di bawah ini untuk menambahkan aset baru dan melakukan penilaian awal.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4">
            <AssetForm
              key={asset ? asset.id : 'new'}
              asset={asset}
              classifications={classifications}
              subClassifications={subClassifications}
              onSave={onSave}
              onCancel={() => onOpenChange(false)}
            />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
