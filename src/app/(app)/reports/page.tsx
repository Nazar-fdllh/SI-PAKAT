import { getRole } from "@/lib/session";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, FileText } from "lucide-react";
import Link from "next/link";
import { assets } from "@/lib/data";

export default async function ReportsPage() {
  const role = await getRole();
  if (role !== 'Administrator' && role !== 'Auditor/Pimpinan') {
    redirect('/dashboard');
  }

  const reportTypes = [
    {
      title: "Laporan Inventaris Aset Lengkap",
      description: "Menampilkan semua aset TIK yang terdaftar beserta detailnya.",
      href: "/print/report",
    },
    {
      title: "Laporan Aset Kritis",
      description: "Hanya menampilkan aset dengan klasifikasi keamanan 'Tinggi'.",
      href: "/print/report?classification=Tinggi",
    },
    {
      title: "Laporan Aset Akan Kadaluarsa",
      description: "Menampilkan aset yang akan atau sudah melewati masa pakainya.",
      href: "/print/report?status=Akan Kadaluarsa",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Pusat Pelaporan</h1>
        <p className="text-muted-foreground">
          Hasilkan dan cetak laporan keamanan aset untuk keperluan audit dan pimpinan.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-md">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-headline text-lg">{report.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{report.description}</CardDescription>
              <Link href={report.href} passHref>
                <Button className="mt-4 w-full" variant="outline">
                  <Printer className="mr-2 h-4 w-4" />
                  Buka & Cetak Laporan
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
