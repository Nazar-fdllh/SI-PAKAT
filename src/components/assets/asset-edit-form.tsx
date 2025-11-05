'use client';

// FORM INI SEKARANG HANYA UNTUK MENGEDIT ASET

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Asset, AssetClassificationValue, Assessment, Classification, SubClassification } from '@/lib/definitions';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { getAssetById } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';


const criteria = [
  { id: 'confidentiality_score', label: 'Kerahasiaan (Confidentiality)' },
  { id: 'integrity_score', label: 'Integritas (Integrity)' },
  { id: 'availability_score', label: 'Ketersediaan (Availability)' },
  { id: 'authenticity_score', label: 'Keaslian (Authenticity)' },
  { id: 'non_repudiation_score', label: 'Non-repudiation' },
];

const scoreOptions = [
  { value: 1, label: '1 - Rendah' },
  { value: 2, label: '2 - Sedang' },
  { value: 3, label: '3 - Tinggi' },
];

const thresholds = {
  high: 11,
  medium: 6,
  low: 5,
};

// Skema Zod yang diperbarui untuk menyertakan field anak yang bersifat opsional
const formSchema = z.object({
  // Base Asset
  asset_code: z.string().min(3, 'Kode aset minimal 3 karakter.'),
  asset_name: z.string().min(3, 'Nama aset minimal 3 karakter.'),
  classification_id: z.coerce.number({required_error: 'Klasifikasi harus dipilih.'}),
  sub_classification_id: z.coerce.number().optional().nullable(),
  identification_of_existence: z.string().min(3, 'Identifikasi keberadaan minimal 3 karakter.'),
  location: z.string().min(3, 'Lokasi minimal 3 karakter.'),
  owner: z.string().min(3, 'Pemilik minimal 3 karakter.'),
  
  // Assessment
  confidentiality_score: z.coerce.number().min(1).max(3),
  integrity_score: z.coerce.number().min(1).max(3),
  availability_score: z.coerce.number().min(1).max(3),
  authenticity_score: z.coerce.number().min(1).max(3),
  non_repudiation_score: z.coerce.number().min(1).max(3),

  // Child table fields (semua opsional)
  personnel_name: z.string().optional(),
  employee_id_number: z.string().optional(),
  function: z.string().optional(),
  position: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  specification: z.string().optional(),
  condition: z.string().optional(),
  application_name: z.string().optional(),
  vendor: z.string().optional(),
  status: z.string().optional(),
  version: z.string().optional(),
  capacity: z.string().optional(),
});


type AssetFormValues = z.infer<typeof formSchema>;

interface AssetEditFormProps {
  assetId: number;
  classifications: Classification[];
  subClassifications: SubClassification[];
  onSave: (data: Partial<Asset & Assessment>) => void;
  onCancel: () => void;
}

const getClassificationValue = (score: number): AssetClassificationValue => {
    if (score >= thresholds.high) return 'Tinggi';
    if (score >= thresholds.medium) return 'Sedang';
    return 'Rendah';
};

export default function AssetEditForm({ assetId, classifications, subClassifications, onSave, onCancel }: AssetEditFormProps) {
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(formSchema),
    // Nilai default akan diisi oleh useEffect setelah data di-fetch
  });

  // useEffect ini adalah kunci utama. Ia berjalan sekali saat komponen dimuat.
  useEffect(() => {
    async function fetchAndSetAssetData() {
      setIsLoading(true);
      try {
        const assetData = await getAssetById(assetId, true);
        
        // Mengisi form dengan data dari backend
        form.reset({
          asset_code: assetData.asset_code ?? '',
          asset_name: assetData.asset_name ?? '',
          classification_id: assetData.classification_id,
          sub_classification_id: assetData.sub_classification_id ?? null,
          identification_of_existence: assetData.identification_of_existence ?? '',
          location: assetData.location ?? '',
          owner: assetData.owner ?? '',
          // Skor dari penilaian terakhir
          confidentiality_score: assetData.confidentiality_score ?? 1,
          integrity_score: assetData.integrity_score ?? 1,
          availability_score: assetData.availability_score ?? 1,
          authenticity_score: assetData.authenticity_score ?? 1,
          non_repudiation_score: assetData.non_repudiation_score ?? 1,
          // Data detail anak
          personnel_name: assetData.personnel_name ?? '',
          employee_id_number: assetData.employee_id_number ?? '',
          function: assetData.function ?? '',
          position: assetData.position ?? '',
          brand: assetData.brand ?? '',
          model: assetData.model ?? '',
          serial_number: assetData.serial_number ?? '',
          specification: assetData.specification ?? '',
          condition: assetData.condition ?? '',
          application_name: assetData.application_name ?? '',
          vendor: assetData.vendor ?? '',
          status: assetData.status ?? '',
          version: assetData.version ?? '',
          capacity: assetData.capacity ?? '',
        });
      } catch (error) {
        console.error("Failed to fetch asset data for editing:", error);
        toast({
            variant: "destructive",
            title: "Gagal Memuat Data Aset",
            description: "Tidak dapat mengambil detail aset untuk diedit."
        });
        onCancel(); // Tutup dialog jika gagal memuat
      } finally {
        setIsLoading(false);
      }
    }

    if (assetId) {
      fetchAndSetAssetData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId, form.reset]);


  const watchedScores = useWatch({
    control: form.control,
    name: ["confidentiality_score", "integrity_score", "availability_score", "authenticity_score", "non_repudiation_score"],
  });
  
  const watchedClassificationId = useWatch({
    control: form.control,
    name: "classification_id",
  });

  const filteredSubClassifications = useMemo(() => {
    if (!watchedClassificationId) return [];
    return subClassifications.filter(sc => sc.classification_id === watchedClassificationId);
  }, [watchedClassificationId, subClassifications]);

  const totalScore = watchedScores.reduce((sum, score) => sum + (Number(score) || 0), 0);
  const assetValue = getClassificationValue(totalScore);

  function onSubmit(data: AssetFormValues) {
    const payload = {
        ...data,
        id: assetId,
        assessed_by: user?.id,
        notes: 'Data aset dasar dan/atau penilaian diperbarui.'
    };
    onSave(payload);
  }

  // Komponen untuk field dinamis
  const DynamicFields = ({ classificationId }: { classificationId: number }) => {
    switch (classificationId) {
      case 1: // SDM & Pihak Ketiga
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 border rounded-md">
            <FormField control={form.control} name="personnel_name" render={({ field }) => ( <FormItem><FormLabel>Nama Personil</FormLabel><FormControl><Input placeholder="Nama Lengkap" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="employee_id_number" render={({ field }) => ( <FormItem><FormLabel>NIP</FormLabel><FormControl><Input placeholder="Nomor Induk Pegawai" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="function" render={({ field }) => ( <FormItem><FormLabel>Fungsi</FormLabel><FormControl><Input placeholder="cth. Manajemen Strategis" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="position" render={({ field }) => ( <FormItem><FormLabel>Jabatan</FormLabel><FormControl><Input placeholder="cth. Kepala Bidang" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
          </div>
        );
      case 3: // Perangkat Keras
        return (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 border rounded-md">
             <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem><FormLabel>Merek</FormLabel><FormControl><Input placeholder="cth. Dell, HP" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="model" render={({ field }) => ( <FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="cth. Latitude 5420" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="serial_number" render={({ field }) => ( <FormItem><FormLabel>Nomor Seri</FormLabel><FormControl><Input placeholder="Nomor unik perangkat" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="condition" render={({ field }) => ( <FormItem><FormLabel>Kondisi</FormLabel><FormControl><Input placeholder="cth. Baru, Bekas, Baik" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="specification" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Spesifikasi</FormLabel><FormControl><Textarea placeholder="Detail spesifikasi teknis" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
           </div>
        );
      case 4: // Perangkat Lunak
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 border rounded-md">
             <FormField control={form.control} name="application_name" render={({ field }) => ( <FormItem><FormLabel>Nama Aplikasi</FormLabel><FormControl><Input placeholder="cth. SI-PAKAT" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="vendor" render={({ field }) => ( <FormItem><FormLabel>Vendor/Pembuat</FormLabel><FormControl><Input placeholder="cth. Diskominfo" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="version" render={({ field }) => ( <FormItem><FormLabel>Versi</FormLabel><FormControl><Input placeholder="cth. 1.0.0" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel>Status Lisensi</FormLabel><FormControl><Input placeholder="cth. Berlisensi, Open Source" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
          </div>
        );
      case 2: // Sarana Pendukung
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 border rounded-md">
            <FormField control={form.control} name="condition" render={({ field }) => ( <FormItem><FormLabel>Kondisi</FormLabel><FormControl><Input placeholder="cth. Baik, Perlu Perbaikan" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="capacity" render={({ field }) => ( <FormItem><FormLabel>Kapasitas</FormLabel><FormControl><Input placeholder="cth. 5000 VA (untuk Genset)" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="specification" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Spesifikasi</FormLabel><FormControl><Textarea placeholder="Detail spesifikasi teknis" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Separator />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* --- Bagian Data Aset Dasar --- */}
        <h3 className="text-lg font-medium font-headline">Detail Aset Dasar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField control={form.control} name="asset_code" render={({ field }) => ( <FormItem><FormLabel>Kode Aset</FormLabel><FormControl><Input placeholder="cth. ASET-001" {...field} /></FormControl><FormMessage /></FormItem> )}/>
           <FormField control={form.control} name="asset_name" render={({ field }) => ( <FormItem><FormLabel>Nama Aset</FormLabel><FormControl><Input placeholder="cth. Server Database Utama" {...field} /></FormControl><FormMessage /></FormItem> )}/>
           <FormField control={form.control} name="classification_id" render={({ field }) => ( <FormItem><FormLabel>Kategori</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value || '')}><FormControl><SelectTrigger><SelectValue placeholder="Pilih kategori aset" /></SelectTrigger></FormControl><SelectContent>{classifications.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
           <FormField control={form.control} name="sub_classification_id" render={({ field }) => ( <FormItem><FormLabel>Sub Kategori</FormLabel><Select onValueChange={(v) => field.onChange(v ? Number(v) : null)} value={field.value ? String(field.value) : ''} disabled={filteredSubClassifications.length === 0}><FormControl><SelectTrigger><SelectValue placeholder="Pilih sub-kategori (opsional)" /></SelectTrigger></FormControl><SelectContent>{filteredSubClassifications.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
        </div>
        <FormField control={form.control} name="identification_of_existence" render={({ field }) => ( <FormItem><FormLabel>Identifikasi Keberadaan</FormLabel><FormControl><Input placeholder="cth. Fisik, Virtual, Personil" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="location" render={({ field }) => ( <FormItem><FormLabel>Lokasi</FormLabel><FormControl><Input placeholder="cth. Ruang Server Lt. 1" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="owner" render={({ field }) => ( <FormItem><FormLabel>Pemilik</FormLabel><FormControl><Input placeholder="cth. Divisi TI" {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem> )}/>
        </div>

        {/* --- Bagian Field Dinamis Berdasarkan Kategori --- */}
        {watchedClassificationId ? (
          <>
            <Separator className="my-6" />
            <h3 className="text-lg font-medium font-headline">Detail Spesifik Aset</h3>
            <DynamicFields classificationId={watchedClassificationId} />
          </>
        ) : null}
        
        <Separator className="my-6" />

        {/* --- Bagian Penilaian --- */}
        <div>
            <h3 className="text-lg font-medium mb-4 font-headline">Perbarui Penilaian</h3>
             <FormDescription className="mb-4 -mt-2">
                Jika Anda mengubah skor di bawah, penilaian baru akan dibuat untuk aset ini.
            </FormDescription>
            <div className="space-y-4">
                {criteria.map((criterion) => (
                    <FormField
                        key={criterion.id}
                        control={form.control}
                        name={criterion.id as keyof AssetFormValues}
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4">
                                <FormLabel className="col-span-2">{criterion.label}</FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value || '1')}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih nilai" /></SelectTrigger></FormControl>
                                    <SelectContent>{scoreOptions.map((option) => ( <SelectItem key={option.value} value={String(option.value)}>{option.label}</SelectItem> ))}</SelectContent>
                                </Select>
                                <FormMessage className="col-span-3" />
                            </FormItem>
                        )}
                    />
                ))}
            </div>
        </div>

        {/* --- Bagian Hasil Penilaian --- */}
        <Card className="bg-secondary/50 mt-6">
            <CardHeader><CardTitle className="text-lg font-headline">Hasil Penilaian</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-center">
                <div><p className="text-sm text-muted-foreground">Total Skor</p><p className="text-4xl font-bold">{totalScore}</p></div>
                <div><p className="text-sm text-muted-foreground">Nilai Aset</p><p className="text-2xl font-bold font-headline text-primary">{assetValue}</p></div>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
            <Button type="submit">Simpan Perubahan</Button>
        </div>
      </form>
    </Form>
  );
}
