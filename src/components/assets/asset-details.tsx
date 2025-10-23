import { type Asset } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
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
      <DetailItem label="Kode Aset" value={asset.asset_code} />
      <DetailItem label="Kategori" value={asset.category_name} />
      <DetailItem label="Identifikasi Keberadaan" value={<p className="max-w-[200px] truncate">{asset.identification_of_existence}</p>} />
      <DetailItem label="Lokasi" value={asset.location} />
      <DetailItem label="Pemilik" value={asset.owner} />
      <DetailItem
        label="Nilai Aset"
        value={
          <Badge
            variant="outline"
            className={cn(
              asset.asset_value === 'Tinggi' && 'text-red-600 border-red-400',
              asset.asset_value === 'Sedang' && 'text-yellow-600 border-yellow-400',
              asset.asset_value === 'Rendah' && 'text-blue-600 border-blue-400',
              'rounded-md'
            )}
          >
            {asset.asset_value}
          </Badge>
        }
      />
    </div>
  );
}
