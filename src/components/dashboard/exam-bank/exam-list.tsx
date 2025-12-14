import { FileText } from "lucide-react";
import type { ExamListItem } from "@/hooks/exams/use-exams";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import type React from "react";

interface ExamListProps {
  exams: ExamListItem[];
  onSelect?: (exam: ExamListItem) => void;
  selectedExamId?: string | null;
}

function getStatusStyle(status: string): React.CSSProperties {
  switch (status) {
    case "Aprobado":
    case "APPROVED":
      // bg-green-100 / text-green-700
      return { backgroundColor: "#dcfce7", color: "#15803d" };
    case "Bajo Revisión":
    case "UNDER_REVIEW":
      // bg-yellow-100 / text-yellow-700
      return { backgroundColor: "#fef9c3", color: "#a16207" };
    case "Rechazado":
    case "REJECTED":
      // bg-red-100 / text-red-700
      return { backgroundColor: "#fee2e2", color: "#b91c1c" };
    case "Borrador":
    case "DRAFT":
      // bg-gray-100 / text-gray-700
      return { backgroundColor: "#f3f4f6", color: "#374151" };
    default:
      return { backgroundColor: "#f3f4f6", color: "#374151" };
  }
}

export function ExamList({ exams, onSelect, selectedExamId }: ExamListProps) {
  return (
    <Card className="p-6">
      <div className="space-y-3">
        {exams.map((exam) => {
          const isSelected = selectedExamId === exam.id;
          const statusText = exam.statusLabel || exam.status;

          return (
            <div
              key={exam.id}
              className={`border rounded-lg ${isSelected ? "border-primary" : ""}`}
            >
              <div
                className={`p-4 hover:bg-accent transition-colors cursor-pointer ${
                  isSelected ? "bg-primary/5" : ""
                }`}
                onClick={() => onSelect?.(exam)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">{exam.title}</h3>

                      <Badge style={getStatusStyle(statusText)}>{statusText}</Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {exam.subjectName ? (
                        <Badge variant="outline">{exam.subjectName}</Badge>
                      ) : null}
                      <Badge variant="secondary">
                        {exam.questionCount} pregunta{exam.questionCount !== 1 ? "s" : ""}
                      </Badge>
                      <Badge variant="secondary">{exam.difficultyLabel}</Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {exam.authorLabel ? (
                        <>
                          <span className="font-medium">Autor:</span> {exam.authorLabel}
                          <span className="mx-2">•</span>
                        </>
                      ) : null}
                      <span>{exam.createdAtLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
