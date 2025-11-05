import { type Asset } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, isValid, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

type DetailItemProps = {
  label: string;
  value?: React.ReactNode;
};

function DetailItem({ label, value }: DetailItemProps) {
  if (!value && typeof value !== 'number') return null;

  return (
    <div className="flex justify-between items-start text-sm">
      <p className="text-muted-foreground">{label}</p>
      <div className="text-right font-medium max-w-[220px] truncate">{value}</div>
    </div>
  );
}

function formatDate(dateString?: string) {
  if (!dateString) return null;
  const date = parseISO(dateString);
  return isValid(date) ? format(date, 'dd MMMM yyyy', { locale: id }) : null;
}

export default function AssetDetails({ asset }: { asset: Asset }) {
  const assetValueBadge = asset.asset_value ? (
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
  ) : null;
  
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-base mt-2">Informasi Umum</h4>
      <DetailItem label="Kode Aset" value={asset.asset_code} />
      <DetailItem label="Kategori" value={asset.category_name} />
      <DetailItem label="Keberadaan" value={asset.identification_of_existence} />
      <DetailItem label="Lokasi" value={asset.location} />
      <DetailItem label="Pemilik" value={asset.owner} />
      <DetailItem label="Nilai Aset" value={assetValueBadge} />

      {asset.classification_id === 1 && ( // SDM
        <>
          <h4 className="font-semibold text-base pt-4 mt-4 border-t">Detail SDM</h4>
          <DetailItem label="Nama Personil" value={asset.personnel_name} />
          <DetailItem label="NIP" value={asset.employee_id_number} />
          <DetailItem label="Fungsi" value={asset.function} />
          <DetailItem label="Jabatan" value={asset.position} />
        </>
      )}

       {asset.classification_id === 3 && ( // Perangkat Keras
        <>
          <h4 className="font-semibold text-base pt-4 mt-4 border-t">Detail Perangkat Keras</h4>
          <DetailItem label="Merek" value={asset.brand} />
          <DetailItem label="Model" value={asset.model} />
          <DetailItem label="No. Seri" value={asset.serial_number} />
          <DetailItem label="Kondisi" value={asset.condition} />
          <DetailItem label="Tgl. Pembelian" value={formatDate(asset.purchase_date)} />
          <DetailItem label="Garansi Habis" value={formatDate(asset.warranty_end_date)} />
          <DetailItem label="Spesifikasi" value={asset.specification} />
        </>
      )}

      {asset.classification_id === 4 && ( // Perangkat Lunak
         <>
          <h4 className="font-semibold text-base pt-4 mt-4 border-t">Detail Perangkat Lunak</h4>
          <DetailItem label="Nama Aplikasi" value={asset.application_name} />
          <DetailItem label="Vendor" value={asset.vendor} />
          <DetailItem label="Versi" value={asset.version} />
          <DetailItem label="Status Lisensi" value={asset.status} />
          <DetailItem label="Tgl. Instalasi" value={formatDate(asset.installation_date)} />
          <DetailItem label="Lisensi Habis" value={formatDate(asset.expiration_date)} />
        </>
      )}
      
      {asset.classification_id === 5 && ( // Sarana Pendukung
         <>
          <h4 className="font-semibold text-base pt-4 mt-4 border-t">Detail Sarana Pendukung</h4>
          <DetailItem label="Kondisi" value={asset.condition} />
          <DetailItem label="Kapasitas" value={asset.capacity} />
          <DetailItem label="Tgl. Perawatan Terakhir" value={formatDate(asset.last_maintenance_date)} />
          <DetailItem label="Jadwal Perawatan Berikutnya" value={formatDate(asset.next_maintenance_date)} />
          <DetailItem label="Spesifikasi" value={asset.specification} />
        </>
      )}
    </div>
  );
}
