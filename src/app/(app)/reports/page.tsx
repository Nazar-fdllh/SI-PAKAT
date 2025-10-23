'use client';

import { useSession } from "@/hooks/use-session";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, FileText } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { initialClassifications } from "@/lib/data";

type ReportCardProps = {
  title: string;
  description: string;
  classification: 'Tinggi' | 'Sedang' | 'Rendah' | 'Semua';
};

function ReportCard({ title, description, classification }: ReportCardProps) {
  const [categoryId, setCategoryId] = useState('all');

  const generateLink = () => {
    let href = `/print/report?categoryId=${categoryId}`;
    if (classification !== 'Semua') {
      href += `&asset_value=${classification}`;
    }
    return href;
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-md">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="font-headline text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {initialClassifications.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Link href={generateLink()} passHref>
          <Button className="w-full" variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Buka & Cetak Laporan
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const { role } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (role && role.name !== 'Administrator' && role.name !== 'Auditor') {
      router.push('/dashboard');
    }
  }, [role, router]);

  if (!role || (role.name !== 'Administrator' && role.name !== 'Auditor')) {
    return <div className="flex justify-center items-center h-full"><p>Memuat atau mengalihkan...</p></div>;
  }

  const reportTypes = [
    {
      title: "Laporan Inventaris Aset Lengkap",
      description: "Menampilkan semua aset TIK terdaftar beserta detailnya.",
      classification: "Semua",
    },
    {
      title: "Laporan Aset Bernilai Tinggi",
      description: "Hanya menampilkan aset dengan klasifikasi keamanan 'Tinggi'.",
      classification: "Tinggi",
    },
    {
      title: "Laporan Aset Bernilai Sedang",
      description: "Hanya menampilkan aset dengan klasifikasi keamanan 'Sedang'.",
      classification: "Sedang",
    },
    {
      title: "Laporan Aset Bernilai Rendah",
      description: "Hanya menampilkan aset dengan klasifikasi keamanan 'Rendah'.",
      classification: "Rendah",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Pusat Pelaporan</h1>
        <p className="text-muted-foreground">
          Hasilkan dan cetak laporan keamanan aset untuk keperluan audit dan pimpinan.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reportTypes.map((report) => (
          <ReportCard
            key={report.title}
            title={report.title}
            description={report.description}
            classification={report.classification}
          />
        ))}
      </div>
    </div>
  );
}
