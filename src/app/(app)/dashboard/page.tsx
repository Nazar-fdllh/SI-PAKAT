import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { assets } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { BarChart, DollarSign, Database, ShieldAlert, Activity } from "lucide-react";
import AssetClassificationChart from "@/components/dashboard/asset-classification-chart";
import AssetValueDistributionChart from "@/components/dashboard/asset-value-chart";
import RecentAssetsTable from "@/components/dashboard/recent-assets-table";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if(!user) {
    redirect('/login');
  }
  const totalAssets = assets.length;
  const highValueAssets = assets.filter(a => a.classification === 'Tinggi').length;
  const expiringSoonAssets = assets.filter(a => a.status === 'Akan Kadaluarsa').length;
  const totalAssetValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  const stats = [
    { title: "Total Aset", value: totalAssets, icon: <Database className="h-4 w-4 text-muted-foreground" /> },
    { title: "Nilai Aset Tinggi", value: highValueAssets, icon: <ShieldAlert className="h-4 w-4 text-muted-foreground" /> },
    { title: "Aset Akan Kadaluarsa", value: expiringSoonAssets, icon: <Activity className="h-4 w-4 text-muted-foreground" /> },
    { title: "Total Nilai Aset", value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAssetValue), icon: <DollarSign className="h-4 w-4 text-muted-foreground" /> }
  ];

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dasbor</h1>
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <CardTitle className="font-headline">Distribusi Nilai Aset</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <AssetValueDistributionChart />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="font-headline">Klasifikasi Aset</CardTitle>
              <CardDescription>Jumlah aset berdasarkan klasifikasi keamanan.</CardDescription>
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
