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

type ExamDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: PendingExamDetail | null;
  loading?: boolean;
  onApprove: (examId: string, comment?: string) => Promise<void>;
  onReject: (examId: string, comment?: string) => Promise<void>;
};

const STATUS_LABEL: Record<PendingExamDetail["status"], string> = {
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  pendiente: "Pendiente",
};

const STATUS_COLOR: Record<PendingExamDetail["status"], string> = {
  aprobado: "bg-green-100 text-green-700 hover:bg-green-100 flex-shrink-0",
  rechazado: "bg-red-100 text-red-700 hover:bg-red-100 flex-shrink-0",
  pendiente: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 flex-shrink-0",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  "Fácil": "bg-green-100 text-green-700 hover:bg-green-100",
  "Regular": "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  "Difícil": "bg-red-100 text-red-700 hover:bg-red-100",
  "Mixta": "bg-blue-100 text-blue-700 hover:bg-blue-100",
};

export function ExamDetailDialog({
  open,
  onOpenChange,
  exam,
  loading = false,
  onApprove,
  onReject,
}: ExamDetailDialogProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const difficultyBadge = useMemo(() => {
    if (!exam) return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    return DIFFICULTY_COLOR[exam.difficulty] ?? "bg-gray-100 text-gray-700 hover:bg-gray-100";
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
                      <Badge className={difficultyBadge}>{exam.difficulty}</Badge>
                    </div>
                  ) : null}
                </div>
                {exam ? (
                  <Badge className={STATUS_COLOR[exam.status]}>{STATUS_LABEL[exam.status]}</Badge>
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
                    <h3 className="font-medium mb-3">Preguntas del Examen ({exam.questions.length})</h3>
                    <div className="space-y-3">
                      {exam.questions.map((question, index) => (
                        <Card key={question.id} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start gap-3">
                              <span className="font-medium text-sm mt-1 flex-shrink-0">{index + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    {question.subtopic}
                                  </Badge>
                                  <Badge
                                    className={`text-xs ${
                                      DIFFICULTY_COLOR[question.difficulty] ?? "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {question.difficulty}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {question.type}
                                  </Badge>
                                </div>
                                <p className="text-sm break-words">{question.body}</p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
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
