import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import AssetTable from "@/components/assets/asset-table";
import { assets } from "@/lib/data";
import { getRole } from "@/lib/session";

export default async function AssetsPage() {
  const role = await getRole();
  const canManage = role === 'Administrator' || role === 'Manajer Aset';

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
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Aset
          </Button>
        )}
      </div>
      
      <AssetTable initialAssets={assets} userRole={role} />
    </div>
  );
}
