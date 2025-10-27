import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllAssets } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { Database, ShieldAlert, Activity } from "lucide-react";
import AssetClassificationChart from "@/components/dashboard/asset-classification-chart";
import AssetValueDistributionChart from "@/components/dashboard/asset-value-chart";
import RecentAssetsTable from "@/components/dashboard/recent-assets-table";
import { redirect } from "next/navigation";
import type { Asset } from "@/lib/definitions";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if(!user) {
    redirect('/login');
  }

  let assets: Asset[] = [];
  try {
    assets = await getAllAssets();
  } catch (error) {
    console.error("Failed to fetch assets for dashboard:", error);
    // Render the page with empty data or show an error message
  }

  const totalAssets = assets.length;
  const highValueAssets = assets.filter(a => a.asset_value === 'Tinggi').length;
  
  // This logic needs to be re-evaluated as 'Akan Kadaluarsa' is not in the data.
  const expiringSoonAssets = 0;

  const stats = [
    { title: "Total Aset", value: totalAssets, icon: <Database className="h-4 w-4 text-muted-foreground" /> },
    { title: "Aset Bernilai Tinggi", value: highValueAssets, icon: <ShieldAlert className="h-4 w-4 text-muted-foreground" /> },
    { title: "Aset Perlu Perhatian", value: expiringSoonAssets, icon: <Activity className="h-4 w-4 text-muted-foreground" /> },
  ];

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dasbor</h1>
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="font-headline">Distribusi Aset per Kategori</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <AssetValueDistributionChart assets={assets} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="font-headline">Nilai Aset</CardTitle>
              <CardDescription>Jumlah aset berdasarkan nilai hasil penilaian.</CardDescription>
            </Header>
            <CardContent>
              <AssetClassificationChart assets={assets} />
            </CardContent>
          </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Aset yang Baru Ditambahkan</CardTitle>
            </CardHeader>
            <CardContent>
                <RecentAssetsTable assets={assets} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}