import { type Assessment } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function AssessmentHistory({ assessments }: { assessments: Assessment[] }) {
  if (assessments.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Belum ada riwayat penilaian.</p>;
  }

  const sortedAssessments = [...assessments].sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());

  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
      {sortedAssessments.map((assessment, index) => (
        <div key={assessment.id} className="flex items-start justify-between gap-4 text-sm">
          <div className="flex-1">
            <p className="font-medium">{format(parseISO(assessment.assessmentDate), 'dd MMM yyyy', { locale: id })}</p>
            <p className="text-xs text-muted-foreground">oleh {assessment.assessedBy}</p>
          </div>
          <div className="flex flex-col items-end">
            <Badge
                variant="outline"
                className={cn(
                'mb-1 rounded-md',
                assessment.classification === 'Tinggi' && 'text-red-600 border-red-400',
                assessment.classification === 'Sedang' && 'text-yellow-600 border-yellow-400',
                assessment.classification === 'Rendah' && 'text-blue-600 border-blue-400',
                )}
            >
              {assessment.classification}
            </Badge>
            <p className="text-xs text-muted-foreground">Skor: {assessment.totalScore}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
