'use client';

import { useState } from 'react';
import { type Asset } from '@/lib/definitions';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const criteria = [
  { id: 'confidentiality', label: 'Kerahasiaan (Confidentiality)' },
  { id: 'integrity', label: 'Integritas (Integrity)' },
  { id: 'availability', label: 'Ketersediaan (Availability)' },
  { id: 'authenticity', label: 'Keaslian (Authenticity)' },
  { id: 'nonRepudiation', label: 'Non-repudiation' },
];

const scoreOptions = [
  { value: 1, label: '1 - Rendah' },
  { value: 2, label: '2 - Sedang' },
  { value: 3, label: '3 - Tinggi' },
];

// Thresholds based on the user-provided image
const thresholds = {
  high: 11,
  medium: 6,
};

export default function AssessmentForm({ asset }: { asset: Asset }) {
  const [scores, setScores] = useState({
    confidentiality: 1,
    integrity: 1,
    availability: 1,
    authenticity: 1,
    nonRepudiation: 1,
  });

  const handleScoreChange = (criterionId: keyof typeof scores, value: string) => {
    setScores((prev) => ({ ...prev, [criterionId]: parseInt(value, 10) }));
  };

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  const getClassification = (score: number) => {
    if (score >= thresholds.high) return 'Tinggi';
    if (score >= thresholds.medium) return 'Sedang';
    return 'Rendah';
  };

  const classification = getClassification(totalScore);

  return (
    <form className="space-y-6">
      <div className="space-y-4">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor={criterion.id} className="col-span-2">
              {criterion.label}
            </Label>
            <Select
              onValueChange={(value) => handleScoreChange(criterion.id as keyof typeof scores, value)}
              defaultValue={String(scores[criterion.id as keyof typeof scores])}
            >
              <SelectTrigger id={criterion.id} className="w-full">
                <SelectValue placeholder="Pilih nilai" />
              </SelectTrigger>
              <SelectContent>
                {scoreOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      
      <Separator />

      <Card className="bg-secondary/50">
        <CardHeader>
            <CardTitle className="text-lg font-headline">Hasil Penilaian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
            <div>
                <p className="text-sm text-muted-foreground">Total Skor</p>
                <p className="text-4xl font-bold">{totalScore}</p>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Klasifikasi Aset</p>
                <p className="text-2xl font-bold font-headline text-primary">{classification}</p>
            </div>
        </CardContent>
        <CardFooter>
            <Button className="w-full">Simpan Penilaian</Button>
        </CardFooter>
      </Card>

    </form>
  );
}
