import { type Asset } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

type DetailItemProps = {
  label: string;
  value: React.ReactNode;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="flex justify-between items-start text-sm">
      <p className="text-muted-foreground">{label}</p>
      <div className="text-right font-medium">{value}</div>
    </div>
  );
}

export default function AssetDetails({ asset }: { asset: Asset }) {
  return (
    <div className="space-y-3">
      <DetailItem label="Kode Aset" value={asset.assetCode} />
      <DetailItem label="Kategori" value={asset.category} />
      <DetailItem label="Spesifikasi" value={<p className="max-w-[200px] truncate">{asset.specifications}</p>} />
      <DetailItem label="Lokasi" value={asset.location} />
      <DetailItem label="Pemilik" value={asset.owner} />
      <DetailItem
        label="Status"
        value={
          <Badge
            variant={asset.status === 'Aktif' ? 'default' : asset.status === 'Non-Aktif' ? 'destructive' : 'secondary'}
            className={cn(
                asset.status === 'Aktif' && 'bg-green-500/20 text-green-700 border-green-500/30',
                asset.status === 'Dalam Perbaikan' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
                asset.status === 'Akan Kadaluarsa' && 'bg-orange-500/20 text-orange-700 border-orange-500/30',
                asset.status === 'Non-Aktif' && 'bg-red-500/20 text-red-700 border-red-500/30',
                'rounded-md'
            )}
          >
            {asset.status}
          </Badge>
        }
      />
      <DetailItem
        label="Klasifikasi"
        value={
          <Badge
            variant="outline"
            className={cn(
              asset.classification === 'Tinggi' && 'text-red-600 border-red-400',
              asset.classification === 'Sedang' && 'text-yellow-600 border-yellow-400',
              asset.classification === 'Rendah' && 'text-blue-600 border-blue-400',
              'rounded-md'
            )}
          >
            {asset.classification}
          </Badge>
        }
      />
      <DetailItem
        label="Tgl. Pembelian"
        value={format(parseISO(asset.purchaseDate), 'dd MMM yyyy', { locale: id })}
      />
      <DetailItem
        label="Tgl. Kadaluarsa"
        value={format(parseISO(asset.expiryDate), 'dd MMM yyyy', { locale: id })}
      />
      <DetailItem
        label="Nilai Aset"
        value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(asset.value)}
      />
    </div>
  );
}
