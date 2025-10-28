'use client';

import { useState, useEffect } from 'react';
import type { Assessment } from '@/lib/definitions';
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
};

type Scores = {
    confidentiality_score: number;
    integrity_score: number;
    availability_score: number;
    authenticity_score: number;
    non_repudiation_score: number;
};

type AssessmentFormProps = {
    initialScores: Partial<Scores>;
    onSave: (assessmentData: Partial<Assessment>) => void;
};


export default function AssessmentForm({ initialScores, onSave }: AssessmentFormProps) {
  const [scores, setScores] = useState<Scores>({
    confidentiality_score: 1,
    integrity_score: 1,
    availability_score: 1,
    authenticity_score: 1,
    non_repudiation_score: 1,
  });
  const [notes, setNotes] = useState('');

  // Populate form with initial scores when the component receives them
  useEffect(() => {
    setScores({
      confidentiality_score: initialScores.confidentiality_score || 1,
      integrity_score: initialScores.integrity_score || 1,
      availability_score: initialScores.availability_score || 1,
      authenticity_score: initialScores.authenticity_score || 1,
      non_repudiation_score: initialScores.non_repudiation_score || 1,
    });
  }, [initialScores]);

  const handleScoreChange = (criterionId: keyof Scores, value: string) => {
    setScores((prev) => ({ ...prev, [criterionId]: parseInt(value, 10) }));
  };

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  const getClassification = (score: number) => {
    if (score >= thresholds.high) return 'Tinggi';
    if (score >= thresholds.medium) return 'Sedang';
    return 'Rendah';
  };

  const classification = getClassification(totalScore);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({ ...scores, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor={criterion.id} className="col-span-2">
              {criterion.label}
            </Label>
            <Select
              onValueChange={(value) => handleScoreChange(criterion.id as keyof Scores, value)}
              value={String(scores[criterion.id as keyof Scores])}
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

       <div>
        <Label htmlFor="notes">Catatan Penilaian (Opsional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="cth. Penilaian ulang setelah upgrade hardware."
          className="mt-2"
        />
      </div>


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
            <Button type="submit" className="w-full">Simpan Penilaian Baru</Button>
        </CardFooter>
      </Card>

    </form>
  );
}
