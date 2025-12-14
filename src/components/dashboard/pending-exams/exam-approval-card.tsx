import { FileCheck, Clock, User, BookOpen } from "lucide-react";
import type { PendingExamListItem } from "@/types/pending-exams/exam";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import type React from "react";

interface ExamApprovalCardProps {
  exam: PendingExamListItem;
  onClick: (exam: PendingExamListItem) => void;
}

function getStatusStyle(status: string): React.CSSProperties {
  switch (status) {
    case "aprobado":
      // bg-green-100 / text-green-700
      return { backgroundColor: "#dcfce7", color: "#15803d" };
    case "rechazado":
      // bg-red-100 / text-red-700
      return { backgroundColor: "#fee2e2", color: "#b91c1c" };
    default:
      // bg-yellow-100 / text-yellow-700
      return { backgroundColor: "#fef9c3", color: "#a16207" };
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "aprobado":
      return "Aprobado";
    case "rechazado":
      return "Rechazado";
    default:
      return "Pendiente";
  }
}

export function ExamApprovalCard({ exam, onClick }: ExamApprovalCardProps) {
  return (
    <Card
      className="p-4 cursor-pointer hover:bg-accent transition-colors"
      onClick={() => onClick(exam)}
    >
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium mb-1 break-words">{exam.examName}</h3>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <BookOpen className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{exam.subject}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{exam.creator}</span>
            </div>
          </div>

          <Badge className="flex-shrink-0 self-start" style={getStatusStyle(exam.status)}>
            {getStatusText(exam.status)}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileCheck className="h-4 w-4 flex-shrink-0" />
            <span>{exam.totalQuestions} preguntas</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{exam.createdDate}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
