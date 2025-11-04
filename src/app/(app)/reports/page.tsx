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
import { getAllClassifications } from "@/lib/data";
import type { Classification } from "@/lib/definitions";

type ReportCardProps = {
  title: string;
  description: string;
  classification: 'Tinggi' | 'Sedang' | 'Rendah' | 'Semua';
  allClassifications: Classification[];
};

function ReportCard({ title, description, classification, allClassifications }: ReportCardProps) {
  const [categoryId, setCategoryId] = useState('all');

  const generateLink = () => {
    // Perbaikan: Selalu tambahkan parameter asset_value.
    // Backend sudah dirancang untuk menangani nilai "Semua".
    // Ini memperbaiki bug di mana laporan lengkap tidak memicu filter backend yang benar.
    return `/print/report?categoryId=${categoryId}&asset_value=${classification}`;
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
            {allClassifications.map((cat) => (
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
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (role && role.name !== 'Administrator' && role.name !== 'Auditor') {
      router.push('/dashboard');
      return;
    }

    async function fetchClassifications() {
      try {
        const data = await getAllClassifications();
        setClassifications(data);
      } catch (error) {
        console.error("Failed to fetch classifications for reports", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (role) {
      fetchClassifications();
    }
  }, [role, router]);

  if (!role || (role.name !== 'Administrator' && role.name !== 'Auditor') || isLoading) {
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
            allClassifications={classifications}
          />
        ))}
      </div>
    </div>
  );
}
