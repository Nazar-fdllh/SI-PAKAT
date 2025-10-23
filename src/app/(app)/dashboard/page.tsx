import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getEnrichedAssets } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { BarChart, Database, ShieldAlert, Activity } from "lucide-react";
import AssetClassificationChart from "@/components/dashboard/asset-classification-chart";
import AssetValueDistributionChart from "@/components/dashboard/asset-value-chart";
import RecentAssetsTable from "@/components/dashboard/recent-assets-table";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if(!user) {
    redirect('/login');
  }

  const assets = getEnrichedAssets();
  const totalAssets = assets.length;
  const highValueAssets = assets.filter(a => a.asset_value === 'Tinggi').length;
  
  // Note: The 'Akan Kadaluarsa' status is gone from the new data structure.
  // This stat will now be 0 or needs to be re-evaluated based on new logic.
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
              <AssetValueDistributionChart />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="font-headline">Nilai Aset</CardTitle>
              <CardDescription>Jumlah aset berdasarkan nilai hasil penilaian.</CardDescription>
            </CardHeader>
            <CardContent>
              <AssetClassificationChart />
            </CardContent>
          </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Aset yang Baru Ditambahkan</CardTitle>
            </CardHeader>
            <CardContent>
                <RecentAssetsTable />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
