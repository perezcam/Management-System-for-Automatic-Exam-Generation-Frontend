"use client";

import { useMemo, useState } from "react";
import { Clock, Users, CheckCircle, XCircle } from "lucide-react";
import type { PendingExamDetail } from "@/types/pending-exams/exam";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import { Card } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { ApproveExamDialog } from "./approve-exam-dialog";
import { RejectExamDialog } from "./reject-exam-dialog";
import { ExamQuestionList } from "@/components/dashboard/common/exam-question-list";
import type { ExamQuestionListItem } from "@/types/exam-question-list";
import type React from "react";

type ExamDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: PendingExamDetail | null;
  questions: ExamQuestionListItem[];
  loading?: boolean;
  onApprove: (examId: string, comment?: string) => Promise<void>;
  onReject: (examId: string, comment?: string) => Promise<void>;
};

const STATUS_LABEL: Record<PendingExamDetail["status"], string> = {
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  pendiente: "Pendiente",
};

function getStatusStyle(status: PendingExamDetail["status"]): React.CSSProperties {
  switch (status) {
    case "aprobado":
      return { backgroundColor: "#dcfce7", color: "#15803d" }; // green-100 / green-700
    case "rechazado":
      return { backgroundColor: "#fee2e2", color: "#b91c1c" }; // red-100 / red-700
    case "pendiente":
      return { backgroundColor: "#fef9c3", color: "#a16207" }; // yellow-100 / yellow-700
    default:
      return { backgroundColor: "#f3f4f6", color: "#374151" }; // gray-100 / gray-700
  }
}

function getDifficultyStyle(difficulty: string): React.CSSProperties {
  switch (difficulty) {
    case "Fácil":
      return { backgroundColor: "#dcfce7", color: "#15803d" };
    case "Regular":
      return { backgroundColor: "#fef9c3", color: "#a16207" };
    case "Difícil":
      return { backgroundColor: "#fee2e2", color: "#b91c1c" };
    case "Mixta":
      return { backgroundColor: "#dbeafe", color: "#1d4ed8" }; // blue-100 / blue-700-ish
    default:
      return { backgroundColor: "#f3f4f6", color: "#374151" };
  }
}

export function ExamDetailDialog({
  open,
  onOpenChange,
  exam,
  loading = false,
  onApprove,
  onReject,
  questions,
}: ExamDetailDialogProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const difficultyStyle = useMemo(() => {
    if (!exam) return { backgroundColor: "#f3f4f6", color: "#374151" } as React.CSSProperties;
    return getDifficultyStyle(exam.difficulty);
  }, [exam]);

  const handleApprove = async (comment?: string) => {
    if (!exam) return;
    setIsProcessing(true);
    try {
      await onApprove(exam.id, comment);
      setShowApproveDialog(false);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (comment?: string) => {
    if (!exam) return;
    setIsProcessing(true);
    try {
      await onReject(exam.id, comment);
      setShowRejectDialog(false);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const isPending = exam?.status === "pendiente";
  const questionCount = questions.length || exam?.questions.length || 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-6xl h-[95vh] max-h-[95vh] flex flex-col p-0">
          <div className="p-6 pb-4">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl mb-2 pr-4">
                    {exam?.examName ?? (loading ? "Cargando examen..." : "Sin información")}
                  </DialogTitle>

                  {exam ? (
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{exam.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{exam.creator}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{exam.createdDate}</span>
                      </div>

                      <Badge style={difficultyStyle}>{exam.difficulty}</Badge>
                    </div>
                  ) : null}
                </div>

                {exam ? (
                  <Badge className="flex-shrink-0" style={getStatusStyle(exam.status)}>
                    {STATUS_LABEL[exam.status]}
                  </Badge>
                ) : null}
              </div>
            </DialogHeader>
          </div>

          <Separator />

          <div className="flex-1 overflow-hidden px-6">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Cargando detalle del examen...
              </div>
            ) : exam ? (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4 py-4">
                  {exam.status === "aprobado" && exam.approvalComment ? (
                    <Card className="p-4 bg-green-50 border-green-200">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-green-900 mb-2">Examen Aprobado</h4>
                          <p className="text-sm text-green-800 break-words">{exam.approvalComment}</p>
                        </div>
                      </div>
                    </Card>
                  ) : null}

                  {exam.status === "rechazado" && exam.rejectionComment ? (
                    <Card className="p-4 bg-red-50 border-red-200">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-red-900 mb-2">Examen Rechazado</h4>
                          <p className="text-sm text-red-800 break-words">{exam.rejectionComment}</p>
                        </div>
                      </div>
                    </Card>
                  ) : null}

                  <div>
                    <h3 className="font-medium mb-3">Preguntas del Examen ({questionCount})</h3>
                    {questions.length > 0 ? (
                      <ExamQuestionList questions={questions} />
                    ) : (
                      <p className="text-sm text-muted-foreground">No se encontraron preguntas para este examen.</p>
                    )}
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No se pudo cargar la información del examen.
              </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-wrap justify-end gap-3 p-6 pt-4">
            {isPending ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isProcessing || loading || !exam}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rechazar
                </Button>
                <Button onClick={() => setShowApproveDialog(true)} disabled={isProcessing || loading || !exam}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprobar
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isPending && exam ? (
        <>
          <ApproveExamDialog
            open={showApproveDialog}
            onOpenChange={setShowApproveDialog}
            onApprove={handleApprove}
            loading={isProcessing}
          />
          <RejectExamDialog
            open={showRejectDialog}
            onOpenChange={setShowRejectDialog}
            onReject={handleReject}
            loading={isProcessing}
          />
        </>
      ) : null}
    </>
  );
}
