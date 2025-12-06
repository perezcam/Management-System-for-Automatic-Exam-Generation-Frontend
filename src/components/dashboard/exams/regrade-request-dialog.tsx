"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ExamAssignment } from "@/types/exam-application/exam"
import { getTeachersBySubject } from "@/services/users/teachers"
import { ExamApplicationService } from "@/services/exam-application/exam-application-service"
import { TeacherUser } from "@/types/users/teacher"
import { Loader2 } from "lucide-react"
import { showSuccessToast, showErrorToast } from "@/utils/toast"

interface RegradeRequestDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    exam: ExamAssignment
    onSuccess?: () => void
}

export function RegradeRequestDialog({
    open,
    onOpenChange,
    exam,
    onSuccess,
}: RegradeRequestDialogProps) {
    const [professors, setProfessors] = useState<TeacherUser[]>([])
    const [selectedProfessorId, setSelectedProfessorId] = useState<string>("")
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)
    const [fetchingProfessors, setFetchingProfessors] = useState(false)

    // Fetch professors when dialog opens
    useEffect(() => {
        if (open && exam.subjectId) {
            setFetchingProfessors(true)
            getTeachersBySubject(exam.subjectId)
                .then((teachers) => {
                    setProfessors(teachers)
                })
                .catch((error) => {
                    showErrorToast("Error al cargar profesores")
                    console.error("Error fetching professors:", error)
                })
                .finally(() => {
                    setFetchingProfessors(false)
                })
        }
    }, [open, exam.subjectId])

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            setSelectedProfessorId("")
            setReason("")
            setProfessors([])
        }
    }, [open])

    const handleSubmit = async () => {
        if (!selectedProfessorId) {
            showErrorToast("Por favor selecciona un profesor")
            return
        }

        if (!reason.trim()) {
            showErrorToast("Por favor ingresa la razón de la recalificación")
            return
        }

        setLoading(true)
        try {
            await ExamApplicationService.submitRegradeRequest({
                examId: exam.examId,
                professorId: selectedProfessorId,
                reason: reason.trim(),
            })

            showSuccessToast("Solicitud de recalificación enviada exitosamente")
            onOpenChange(false)
            if (onSuccess) {
                onSuccess()
            }
        } catch (error) {
            showErrorToast("Error al enviar la solicitud de recalificación")
            console.error("Error submitting regrade request:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Solicitar Recalificación</DialogTitle>
                    <DialogDescription>
                        Solicita una recalificación de tu examen
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Exam Info */}
                    <div className="space-y-2">
                        <div className="text-sm">
                            <span className="font-medium">Examen: </span>
                            <span className="text-muted-foreground">
                                {exam.title ?? exam.examTitle ?? `Examen de ${exam.subjectName}`}
                            </span>
                        </div>
                        <div className="text-sm">
                            <span className="font-medium">Calificación actual: </span>
                            <span className="text-xl font-mono text-green-600">{exam.grade}</span>
                        </div>
                    </div>

                    {/* Professor Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="professor-select">
                            Profesor para recalificación <span className="text-red-500">*</span>
                        </Label>
                        {fetchingProfessors ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Cargando profesores...</span>
                            </div>
                        ) : (
                            <Select
                                value={selectedProfessorId}
                                onValueChange={setSelectedProfessorId}
                                disabled={loading || professors.length === 0}
                            >
                                <SelectTrigger id="professor-select">
                                    <SelectValue placeholder="Selecciona un profesor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {professors.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            No hay profesores disponibles
                                        </div>
                                    ) : (
                                        professors.map((professor) => (
                                            <SelectItem key={professor.id} value={professor.id}>
                                                {professor.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">
                            Razón de la recalificación <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Ej: Considero que la pregunta 5 fue calificada incorrectamente"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={loading}
                            rows={4}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            Explica brevemente por qué solicitas la recalificación
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || fetchingProfessors}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            "Enviar Solicitud"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
