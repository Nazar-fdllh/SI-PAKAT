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

// Skema validasi untuk form edit
const formSchema = z.object({
  asset_code: z.string().min(3, 'Kode aset minimal 3 karakter.'),
  asset_name: z.string().min(3, 'Nama aset minimal 3 karakter.'),
  classification_id: z.coerce.number({required_error: 'Klasifikasi harus dipilih.'}),
  sub_classification_id: z.coerce.number().optional().nullable(),
  identification_of_existence: z.string().min(3, 'Identifikasi keberadaan minimal 3 karakter.'),
  location: z.string().min(3, 'Lokasi minimal 3 karakter.'),
  owner: z.string().min(3, 'Pemilik minimal 3 karakter.'),
  
  // Penilaian bersifat opsional saat edit, tapi jika diisi, harus valid
  confidentiality_score: z.coerce.number().min(1).max(3),
  integrity_score: z.coerce.number().min(1).max(3),
  availability_score: z.coerce.number().min(1).max(3),
  authenticity_score: z.coerce.number().min(1).max(3),
  non_repudiation_score: z.coerce.number().min(1).max(3),
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
        // 1. Ambil data aset lengkap dari backend
        const assetData = await getAssetById(assetId);
        
        // 2. Isi form dengan data yang didapat
        form.reset({
          asset_code: assetData.asset_code ?? '',
          asset_name: assetData.asset_name ?? '',
          classification_id: assetData.classification_id,
          sub_classification_id: assetData.sub_classification_id ?? null,
          identification_of_existence: assetData.identification_of_existence ?? '',
          location: assetData.location ?? '',
          owner: assetData.owner ?? '',
          // Gunakan skor dari penilaian terakhir sebagai nilai awal
          confidentiality_score: assetData.confidentiality_score ?? 1,
          integrity_score: assetData.integrity_score ?? 1,
          availability_score: assetData.availability_score ?? 1,
          authenticity_score: assetData.authenticity_score ?? 1,
          non_repudiation_score: assetData.non_repudiation_score ?? 1,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField
            control={form.control}
            name="asset_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Aset</FormLabel>
                <FormControl>
                  <Input placeholder="cth. ASET-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="asset_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Aset</FormLabel>
                <FormControl>
                  <Input placeholder="cth. Server Database Utama" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="classification_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value || '')}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori aset" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classifications.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="sub_classification_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub Kategori</FormLabel>
                <Select onValueChange={(v) => field.onChange(v ? Number(v) : null)} value={field.value ? String(field.value) : ''} disabled={filteredSubClassifications.length === 0}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih sub-kategori aset (opsional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredSubClassifications.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormDescription>Pilih kategori terlebih dahulu.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="identification_of_existence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifikasi Keberadaan</FormLabel>
              <FormControl>
                <Input placeholder="cth. Fisik, Virtual, Personil" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Lokasi</FormLabel>
                    <FormControl>
                    <Input placeholder="cth. Ruang Server Lt. 1" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Pemilik</FormLabel>
                    <FormControl>
                    <Input placeholder="cth. Divisi TI" {...field} value={field.value || ''}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        
        <Separator className="my-6" />

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
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih nilai" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {scoreOptions.map((option) => (
                                            <SelectItem key={option.value} value={String(option.value)}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className="col-span-3" />
                            </FormItem>
                        )}
                    />
                ))}
            </div>
        </div>

        <Card className="bg-secondary/50 mt-6">
            <CardHeader>
                <CardTitle className="text-lg font-headline">Hasil Penilaian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Total Skor</p>
                    <p className="text-4xl font-bold">{totalScore}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Nilai Aset</p>
                    <p className="text-2xl font-bold font-headline text-primary">{assetValue}</p>
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
                Batal
            </Button>
            <Button type="submit">Simpan</Button>
        </div>
      </form>
    </Form>
  );
}
