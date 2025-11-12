'use client';

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
import { Textarea } from '../ui/textarea';
import { getNextAssetCode } from '@/lib/data';
import { toast } from '@/hooks/use-toast';

const textOnlyRegex = /^[A-Za-z\s]+$/;

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

const formSchema = z.object({
  // Base Asset
  asset_code: z.string().min(1, 'Kode aset harus diisi.'),
  asset_name: z.string().min(3, 'Nama aset minimal 3 karakter.').regex(textOnlyRegex, 'Nama aset hanya boleh berisi huruf dan spasi.'),
  classification_id: z.coerce.number({required_error: 'Klasifikasi harus dipilih.'}),
  sub_classification_id: z.coerce.number().optional().nullable(),
  identification_of_existence: z.string().min(3, 'Identifikasi keberadaan minimal 3 karakter.').regex(textOnlyRegex, 'Hanya boleh berisi huruf dan spasi.'),
  location: z.string().min(3, 'Lokasi minimal 3 karakter.'),
  owner: z.string().min(3, 'Pemilik minimal 3 karakter.').regex(textOnlyRegex, 'Pemilik hanya boleh berisi huruf dan spasi.'),
  
  // Assessment
  confidentiality_score: z.coerce.number().min(1).max(3),
  integrity_score: z.coerce.number().min(1).max(3),
  availability_score: z.coerce.number().min(1).max(3),
  authenticity_score: z.coerce.number().min(1).max(3),
  non_repudiation_score: z.coerce.number().min(1).max(3),

  // Child table fields
  personnel_name: z.string().regex(textOnlyRegex, 'Nama personil hanya boleh berisi huruf dan spasi.').optional().or(z.literal('')),
  employee_id_number: z.string().optional(),
  function: z.string().regex(textOnlyRegex, 'Fungsi hanya boleh berisi huruf dan spasi.').optional().or(z.literal('')),
  position: z.string().regex(textOnlyRegex, 'Posisi hanya boleh berisi huruf dan spasi.').optional().or(z.literal('')),
  
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
  last_maintenance_date: z.string().optional(),
  next_maintenance_date: z.string().optional(),

  storage_format: z.string().optional(),
  validity_period: z.string().optional(),
  sensitivity_level: z.string().optional(),
  storage_location_detail: z.string().optional(),
  retention_policy: z.string().optional(),
  last_backup_date: z.string().optional(),
});

type AssetFormValues = z.infer<typeof formSchema>;

interface AssetFormProps {
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

export function AssetForm({ classifications, subClassifications, onSave, onCancel }: AssetFormProps) {
  const { user } = useSession();
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asset_code: '',
      asset_name: '',
      classification_id: undefined,
      sub_classification_id: null,
      identification_of_existence: '',
      location: '',
      owner: '',
      confidentiality_score: 1,
      integrity_score: 1,
      availability_score: 1,
      authenticity_score: 1,
      non_repudiation_score: 1,
    },
  });

  const watchedClassificationId = useWatch({
    control: form.control,
    name: "classification_id",
  });
  
  useEffect(() => {
    const generateAssetCode = async () => {
      if (!watchedClassificationId) {
        form.setValue('asset_code', '');
        return;
      };

      setIsGeneratingCode(true);
      try {
        const data = await getNextAssetCode(watchedClassificationId);
        form.setValue('asset_code', data.next_code);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Gagal Membuat Kode Aset',
          description: error instanceof Error ? error.message : 'Terjadi kesalahan di server.',
        });
        form.setValue('asset_code', 'Error');
      } finally {
        setIsGeneratingCode(false);
      }
    };

    generateAssetCode();
  }, [watchedClassificationId, form]);

  const watchedScores = useWatch({
    control: form.control,
    name: ["confidentiality_score", "integrity_score", "availability_score", "authenticity_score", "non_repudiation_score"],
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
        assessed_by: user?.id,
        notes: 'Penilaian awal saat pembuatan aset.'
    };
    onSave(payload);
  }

  const DynamicFields = ({ classificationId }: { classificationId: number }) => {
    switch (classificationId) {
      case 1: // SDM & Pihak Ketiga
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 border rounded-md">
            <FormField control={form.control} name="personnel_name" render={({ field }) => ( <FormItem><FormLabel>Nama Personil</FormLabel><FormControl><Input placeholder="Nama Lengkap" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="employee_id_number" render={({ field }) => ( <FormItem><FormLabel>NIP</FormLabel><FormControl><Input placeholder="Nomor Induk Pegawai" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="function" render={({ field }) => ( <FormItem><FormLabel>Fungsi</FormLabel><FormControl><Input placeholder="cth. Manajemen Strategis" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="position" render={({ field }) => ( <FormItem><FormLabel>Jabatan</FormLabel><FormControl><Input placeholder="cth. Kepala Bidang" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </div>
        );
      case 2: // Sarana Pendukung
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 border rounded-md">
            <FormField control={form.control} name="condition" render={({ field }) => ( <FormItem><FormLabel>Kondisi</FormLabel><FormControl><Input placeholder="cth. Baik, Perlu Perbaikan" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="capacity" render={({ field }) => ( <FormItem><FormLabel>Kapasitas</FormLabel><FormControl><Input placeholder="cth. 5000 VA (untuk Genset)" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="last_maintenance_date" render={({ field }) => ( <FormItem><FormLabel>Tgl. Perawatan Terakhir</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="next_maintenance_date" render={({ field }) => ( <FormItem><FormLabel>Jadwal Perawatan Berikutnya</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="specification" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Spesifikasi</FormLabel><FormControl><Textarea placeholder="Detail spesifikasi teknis" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </div>
        );
      case 3: // Perangkat Keras
        return (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 border rounded-md">
             <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem><FormLabel>Merek</FormLabel><FormControl><Input placeholder="cth. Dell, HP" {...field} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="model" render={({ field }) => ( <FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="cth. Latitude 5420" {...field} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="serial_number" render={({ field }) => ( <FormItem><FormLabel>Nomor Seri</FormLabel><FormControl><Input placeholder="Nomor unik perangkat" {...field} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="condition" render={({ field }) => ( <FormItem><FormLabel>Kondisi</FormLabel><FormControl><Input placeholder="cth. Baru, Bekas, Baik" {...field} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="specification" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Spesifikasi</FormLabel><FormControl><Textarea placeholder="Detail spesifikasi teknis" {...field} /></FormControl><FormMessage /></FormItem> )} />
           </div>
        );
      case 4: // Perangkat Lunak
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 border rounded-md">
             <FormField control={form.control} name="application_name" render={({ field }) => ( <FormItem><FormLabel>Nama Aplikasi</FormLabel><FormControl><Input placeholder="cth. SI-PAKAT" {...field} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="vendor" render={({ field }) => ( <FormItem><FormLabel>Vendor/Pembuat</FormLabel><FormControl><Input placeholder="cth. Diskominfo" {...field} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="version" render={({ field }) => ( <FormItem><FormLabel>Versi</FormLabel><FormControl><Input placeholder="cth. 1.0.0" {...field} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel>Status Lisensi</FormLabel><FormControl><Input placeholder="cth. Berlisensi, Open Source" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </div>
        );
      case 5: // Data & Informasi
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 border rounded-md">
            <FormField control={form.control} name="storage_format" render={({ field }) => ( <FormItem><FormLabel>Format Penyimpanan</FormLabel><FormControl><Input placeholder="cth. Digital, Cetak" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="sensitivity_level" render={({ field }) => ( <FormItem><FormLabel>Tingkat Sensitivitas</FormLabel><FormControl><Input placeholder="cth. Rahasia, Internal, Publik" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="storage_location_detail" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Detail Lokasi Penyimpanan</FormLabel><FormControl><Input placeholder="cth. Folder X di Server Y" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="validity_period" render={({ field }) => ( <FormItem><FormLabel>Masa Berlaku</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="last_backup_date" render={({ field }) => ( <FormItem><FormLabel>Tanggal Backup Terakhir</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="retention_policy" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Kebijakan Retensi</FormLabel><FormControl><Textarea placeholder="Jelaskan kebijakan retensi data..." {...field} /></FormControl><FormMessage /></FormItem> )} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-lg font-medium font-headline">Detail Aset Dasar</h3>
        <FormField control={form.control} name="classification_id" render={({ field }) => ( <FormItem><FormLabel>Kategori Aset</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value || '')}><FormControl><SelectTrigger><SelectValue placeholder="Pilih kategori untuk membuat kode aset" /></SelectTrigger></FormControl><SelectContent>{classifications.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
        <FormField control={form.control} name="asset_code" render={({ field }) => ( <FormItem><FormLabel>Kode Aset</FormLabel><FormControl><Input placeholder={isGeneratingCode ? "Membuat kode..." : "Pilih kategori terlebih dahulu"} {...field} readOnly /></FormControl><FormDescription>Kode ini dibuat oleh sistem secara otomatis.</FormDescription><FormMessage /></FormItem> )}/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField control={form.control} name="asset_name" render={({ field }) => ( <FormItem><FormLabel>Nama Aset</FormLabel><FormControl><Input placeholder="cth. Server Database Utama" {...field} /></FormControl><FormMessage /></FormItem> )}/>
           <FormField control={form.control} name="sub_classification_id" render={({ field }) => ( <FormItem><FormLabel>Sub Kategori</FormLabel><Select onValueChange={(v) => field.onChange(v ? Number(v) : null)} value={field.value ? String(field.value) : ''} disabled={filteredSubClassifications.length === 0}><FormControl><SelectTrigger><SelectValue placeholder="Pilih sub-kategori (opsional)" /></SelectTrigger></FormControl><SelectContent>{filteredSubClassifications.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
        </div>
        <FormField control={form.control} name="identification_of_existence" render={({ field }) => ( <FormItem><FormLabel>Identifikasi Keberadaan</FormLabel><FormControl><Input placeholder="cth. Fisik, Virtual, Personil" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="location" render={({ field }) => ( <FormItem><FormLabel>Lokasi</FormLabel><FormControl><Input placeholder="cth. Ruang Server Lt. 1" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="owner" render={({ field }) => ( <FormItem><FormLabel>Pemilik</FormLabel><FormControl><Input placeholder="cth. Divisi TI" {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem> )}/>
        </div>
        
        {watchedClassificationId ? (
          <>
            <Separator className="my-6" />
            <h3 className="text-lg font-medium font-headline">Detail Spesifik Aset</h3>
            <DynamicFields classificationId={watchedClassificationId} />
          </>
        ) : null}

        <Separator className="my-6" />

        <div>
            <h3 className="text-lg font-medium mb-4 font-headline">Penilaian Awal</h3>
             <FormDescription className="mb-4 -mt-2">
                Lakukan penilaian awal untuk aset baru ini.
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

        <Card className="bg-secondary/50 mt-6">
            <CardHeader><CardTitle className="text-lg font-headline">Hasil Penilaian</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-center">
                <div><p className="text-sm text-muted-foreground">Total Skor</p><p className="text-4xl font-bold">{totalScore}</p></div>
                <div><p className="text-sm text-muted-foreground">Nilai Aset</p><p className="text-2xl font-bold font-headline text-primary">{assetValue}</p></div>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
            <Button type="submit">Simpan</Button>
        </div>
      </form>
    </Form>
  );
}
