'use client'

import React, { useEffect, useState } from 'react'
import { getReportData, initialClassifications } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Printer, Shield, ArrowLeft, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Asset, AssetClassificationValue } from '@/lib/definitions'
import { toast } from '@/hooks/use-toast'

function ReportHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between pb-4 border-b-2 border-gray-800 dark:border-gray-300">
      <div className="flex items-center gap-3">
        <Shield className="w-10 h-10 text-primary-dark dark:text-primary-light" />
        <div>
          <h1 className="text-2xl font-bold font-headline text-gray-800 dark:text-gray-100">SI-PAKAT Digital</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Sistem Informasi Pengelolaan Keamanan Aset TIK</p>
        </div>
      </div>
      <div className="text-right">
        <h2 className="text-xl font-semibold font-headline text-gray-700 dark:text-gray-200">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tanggal Cetak: {format(new Date(), 'dd MMMM yyyy', { locale: id })}
        </p>
      </div>
    </header>
  )
}

function ReportStats({ data }: { data: Asset[] }) {
    const totalAssets = data.length;
    const classifications = data.reduce((acc, asset) => {
        const value = asset.asset_value || 'N/A';
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-3 gap-4 my-6 text-center">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Aset</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{totalAssets}</p>
      </div>
       <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-300">Nilai Tinggi</p>
        <p className="text-2xl font-bold text-red-800 dark:text-red-200">{classifications['Tinggi'] || 0}</p>
      </div>
       <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
        <p className="text-sm text-yellow-600 dark:text-yellow-300">Nilai Sedang</p>
        <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{classifications['Sedang'] || 0}</p>
      </div>
    </div>
  )
}

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const assetValueFilter = searchParams.get('asset_value');
  const categoryIdFilter = searchParams.get('categoryId');

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const filters = {
          asset_value: assetValueFilter || undefined,
          categoryId: categoryIdFilter || undefined,
        };
        const data = await getReportData(filters);
        setFilteredAssets(data);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Gagal Membuat Laporan',
          description: error instanceof Error ? error.message : 'Terjadi kesalahan'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [assetValueFilter, categoryIdFilter]);


  const getReportTitle = () => {
    let title = "Laporan Aset";
    const categoryId = categoryIdFilter && categoryIdFilter !== 'all' ? parseInt(categoryIdFilter) : null;
    const category = categoryId ? initialClassifications.find(c => c.id === categoryId) : null;

    if (assetValueFilter && assetValueFilter !== 'Semua') {
      title += ` Bernilai ${assetValueFilter}`;
    } else {
      title = "Laporan Inventaris Aset Lengkap";
    }

    if (category) {
      title += ` Kategori ${category.name}`;
    }
    
    return title;
  }
  
  const reportTitle = getReportTitle();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary"/>
            <p className="text-muted-foreground">Menyiapkan laporan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800/50 text-gray-900 dark:text-gray-100">
       <div className="fixed top-4 right-4 no-print flex gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Cetak Halaman Ini
        </Button>
      </div>
      <div className="print-container bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
        <ReportHeader title={reportTitle} />
        <ReportStats data={filteredAssets} />

        <div className="overflow-x-auto mt-6">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-3">No</th>
                <th scope="col" className="px-4 py-3">Kode Aset</th>
                <th scope="col" className="px-4 py-3">Nama Aset</th>
                <th scope="col" className="px-4 py-3">Kategori</th>
                <th scope="col" className="px-4 py-3">Pemilik</th>
                <th scope="col" className="px-4 py-3 text-right">Nilai Aset</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset, index) => (
                <tr key={asset.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-mono">{asset.asset_code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{asset.asset_name}</td>
                  <td className="px-4 py-3">{asset.category_name}</td>
                  <td className="px-4 py-3">{asset.owner}</td>
                  <td className="px-4 py-3 text-right font-semibold">{asset.asset_value}</td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                 <tr>
                    <td colSpan={6} className="text-center py-8">Tidak ada data untuk ditampilkan.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="mt-8 pt-4 border-t text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Laporan ini dihasilkan oleh sistem SI-PAKAT Digital.</p>
        </footer>
      </div>
    </div>
  )
}