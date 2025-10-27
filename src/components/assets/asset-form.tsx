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
import type { Asset, AssetClassificationValue } from '@/lib/definitions';
import { initialClassifications, initialSubClassifications } from '@/lib/data';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useEffect, useMemo } from 'react';
import { getCurrentUser } from '@/lib/session';
import { useSession } from '@/hooks/use-session';

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

// Frontend schema now matches the backend payload for creation
const formSchema = z.object({
  asset_name: z.string().min(3, 'Nama aset minimal 3 karakter.'),
  classification_id: z.coerce.number({required_error: 'Klasifikasi harus dipilih.'}),
  sub_classification_id: z.coerce.number().optional().nullable(),
  identification_of_existence: z.string().min(3, 'Identifikasi keberadaan minimal 3 karakter.'),
  location: z.string().min(3, 'Lokasi minimal 3 karakter.'),
  owner: z.string().min(3, 'Pemilik minimal 3 karakter.'),
  // Assessment scores are now part of the form
  confidentiality_score: z.coerce.number().min(1).max(3),
  integrity_score: z.coerce.number().min(1).max(3),
  availability_score: z.coerce.number().min(1).max(3),
  authenticity_score: z.coerce.number().min(1).max(3),
  non_repudiation_score: z.coerce.number().min(1).max(3),
});

type AssetFormValues = z.infer<typeof formSchema>;

interface AssetFormProps {
  asset: Asset | null;
  onSave: (data: Partial<Asset & Record<string, any>>) => void;
  onCancel: () => void;
}

const getClassificationValue = (score: number): AssetClassificationValue => {
    if (score >= thresholds.high) return 'Tinggi';
    if (score >= thresholds.medium) return 'Sedang';
    return 'Rendah';
};

export function AssetForm({ asset, onSave, onCancel }: AssetFormProps) {
  const { user } = useSession();

  const defaultValues = asset ? {
    ...asset,
    // When editing, we don't handle assessment scores here. This form is for creation logic.
    confidentiality_score: 1,
    integrity_score: 1,
    availability_score: 1,
    authenticity_score: 1,
    non_repudiation_score: 1,
  } : {
    asset_name: '',
    classification_id: 1,
    sub_classification_id: null,
    identification_of_existence: '',
    location: '',
    owner: '',
    confidentiality_score: 1,
    integrity_score: 1,
    availability_score: 1,
    authenticity_score: 1,
    non_repudiation_score: 1,
  };
  
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const watchedScores = useWatch({
    control: form.control,
    name: ["confidentiality_score", "integrity_score", "availability_score", "authenticity_score", "non_repudiation_score"],
  });
  
  const watchedClassificationId = useWatch({
    control: form.control,
    name: "classification_id",
  });

  const subClassifications = useMemo(() => {
    return initialSubClassifications.filter(sc => sc.classification_id === watchedClassificationId);
  }, [watchedClassificationId]);

  const totalScore = watchedScores.reduce((sum, score) => sum + (Number(score) || 0), 0);
  const assetValue = getClassificationValue(totalScore);

  function onSubmit(data: AssetFormValues) {
    const payload = {
        ...data,
        id: asset?.id || 0,
        // Send all necessary data for backend to create Asset and Assessment
        total_score: totalScore,
        asset_value: assetValue,
        assessed_by: user?.id,
    };
    onSave(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori aset" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {initialClassifications.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
            control={form.control}
            name="sub_classification_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub Kategori</FormLabel>
                <Select onValueChange={(v) => field.onChange(v ? Number(v) : null)} defaultValue={field.value ? String(field.value) : undefined} disabled={subClassifications.length === 0}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih sub-kategori aset (opsional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subClassifications.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormDescription>Pilih kategori terlebih dahulu.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
          control={form.control}
          name="identification_of_existence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifikasi Keberadaan</FormLabel>
              <FormControl>
                <Input placeholder="cth. Fisik, Virtual, Personil" {...field} />
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
                    <Input placeholder="cth. Ruang Server Lt. 1" {...field} />
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
                    <Input placeholder="cth. Divisi TI" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        
        <Separator className="my-6" />

        <div>
            <h3 className="text-lg font-medium mb-4 font-headline">Penilaian Awal</h3>
            <div className="space-y-4">
                {criteria.map((criterion) => (
                    <FormField
                        key={criterion.id}
                        control={form.control}
                        name={criterion.id as keyof AssetFormValues}
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4">
                                <FormLabel className="col-span-2">{criterion.label}</FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}>
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
                <CardTitle className="text-lg font-headline">Hasil Penilaian Awal</CardTitle>
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
