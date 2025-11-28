import type { PaginationMeta, RetrieveOneSchema } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import { PENDING_EXAMS_ENDPOINT, withQueryParams } from "@/services/api/endpoints";
import type {
  PendingExamDetail,
  PendingExamDifficulty,
  PendingExamListItem,
  PendingExamQuestion,
  PendingExamStatus,
} from "@/types/pending-exams/exam";

export type ListPendingExamsQuery = {
  title?: string;
  subjectId?: string;
  authorId?: string;
  examStatus?: PendingExamStatus | string;
  limit?: number;
  offset?: number;
};

type PendingExamListItemApi = {
  id: string;
  title?: string;
  examName?: string;
  subject?: string;
  subjectName?: string;
  subjectId?: string;
  difficulty?: string;
  examStatus?: string;
  author?: string;
  authorName?: string;
  authorId?: string;
  creator?: string;
  creatorId?: string;
  questionCount?: number;
  totalQuestions?: number;
  createdAt?: string;
  createdDate?: string;
  updatedAt?: string;       
  validatedAt?: string;    
};


type PendingExamQuestionApi = {
  id: string;
  body?: string;
  statement?: string;
  enunciado?: string;
  text?: string;
  type?: string;
  questionType?: string;
  difficulty?: string;
  subtopic?: string;
  subtopicName?: string;
};

type PendingExamDetailApi = PendingExamListItemApi & {
  approvalComment?: string | null;
  rejectionComment?: string | null;
  observations?: string | null;
  questions?: PendingExamQuestionApi[];
};

const STATUS_TO_BACKEND = new Map<PendingExamStatus, string>([
  ["pendiente", "draft"],
  ["aprobado", "approved"],
  ["rechazado", "rejected"],
]);

const STATUS_FROM_BACKEND = new Map<string, PendingExamStatus>([
  ["draft", "pendiente"],
  ["approved", "aprobado"],
  ["rejected", "rechazado"],
]);

const DIFFICULTY_FROM_BACKEND = new Map<string, PendingExamDifficulty>([
  ["easy", "Fácil"],
  ["medium", "Regular"],
  ["hard", "Difícil"],
  ["mixed", "Mixta"],
]);

const mapExamStatusParam = (status?: string) => {
  if (!status) return undefined;
  const normalized = status.toLowerCase() as PendingExamStatus;
  return STATUS_TO_BACKEND.get(normalized) ?? status;
};

const mapExamStatusResponse = (status?: string): PendingExamStatus => {
  if (!status) return "pendiente";
  const normalized = status.toLowerCase();
  return STATUS_FROM_BACKEND.get(normalized) ?? "pendiente";
};

const mapExamDifficultyResponse = (difficulty?: string): PendingExamDifficulty => {
  if (!difficulty) return "Regular";
  const normalized = difficulty.toLowerCase();
  return DIFFICULTY_FROM_BACKEND.get(normalized) ?? "Regular";
};

const mapPendingExamQuestion = (question: PendingExamQuestionApi): PendingExamQuestion => ({
  id: question.id,
  body: question.body ?? question.statement ?? question.enunciado ?? question.text ?? "",
  type: question.type ?? question.questionType ?? "",
  difficulty: mapExamDifficultyResponse(question.difficulty),
  subtopic: question.subtopic ?? question.subtopicName ?? "",
});

const mapPendingExamListItem = (exam: PendingExamListItemApi): PendingExamListItem => ({
  id: exam.id,
  examName: exam.title ?? exam.examName ?? "Examen sin título",
  subject: exam.subject ?? exam.subjectName ?? exam.subjectId ?? "",
  subjectId: exam.subjectId,
  creator: exam.author ?? exam.authorName ?? exam.creator ?? exam.authorId ?? "",
  creatorId: exam.authorId ?? exam.creatorId,
  createdDate: exam.createdAt ?? exam.createdDate ?? "",
  status: mapExamStatusResponse(exam.examStatus),
  difficulty: mapExamDifficultyResponse(exam.difficulty),
  totalQuestions: exam.questionCount ?? exam.totalQuestions ?? 0,
});

const mapPendingExamDetail = (exam: PendingExamDetailApi): PendingExamDetail => {
  const sharedObservation = exam.observations ?? null;
  return {
    ...mapPendingExamListItem(exam),
    questions: (exam.questions ?? []).map(mapPendingExamQuestion),
    approvalComment: exam.approvalComment ?? sharedObservation,
    rejectionComment: exam.rejectionComment ?? sharedObservation,
  };
};

const sanitizeExamId = (examId: string) => examId.split("?")[0]?.split("#")[0] ?? "";

const buildExamUrl = (examId: string, suffix: string = "") => {
  const cleanId = sanitizeExamId(examId);
  if (!cleanId) {
    throw new Error("Identificador de examen inválido");
  }
  return `${PENDING_EXAMS_ENDPOINT}/${encodeURIComponent(cleanId)}${suffix}`;
};

// Ajustado a lo que devuelve el backend: colección paginada
type PendingExamListSchema = {
  success: boolean;
  message: string;
  data: PendingExamListItemApi[];
  meta: PaginationMeta;
};

type PendingExamDetailSchema = RetrieveOneSchema<PendingExamDetailApi>;

const ensureExamDetail = (schema: PendingExamDetailSchema, fallbackMessage: string) => {
  if (!schema.data) {
    throw new Error(fallbackMessage);
  }
  return mapPendingExamDetail(schema.data);
};

export const fetchPendingExams = async (params: ListPendingExamsQuery = {}) => {
  const url = withQueryParams(PENDING_EXAMS_ENDPOINT, {
    title: params.title,
    subjectId: params.subjectId,
    authorId: params.authorId,
    examStatus: mapExamStatusParam(params.examStatus),
    limit: params.limit,
    offset: params.offset,
  });

  const response = await backendRequest<PendingExamListSchema>(url);

  return {
    data: (response.data ?? []).map(mapPendingExamListItem),
    meta: response.meta,
  };
};

export const fetchPendingExamDetail = async (examId: string): Promise<PendingExamDetail> => {
  const response = await backendRequest<PendingExamDetailSchema>(buildExamUrl(examId));
  return ensureExamDetail(response, "El backend no devolvió el detalle del examen solicitado");
};

export type ApprovePendingExamPayload = {
  comment?: string;
};

export const approvePendingExam = async (
  examId: string,
  payload: ApprovePendingExamPayload = {},
): Promise<PendingExamDetail> => {
  const response = await backendRequest<PendingExamDetailSchema>(buildExamUrl(examId, "/approve"), {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return ensureExamDetail(response, "El backend no devolvió el examen aprobado");
};

export type RejectPendingExamPayload = {
  comment?: string;
};

export const rejectPendingExam = async (
  examId: string,
  payload: RejectPendingExamPayload = {},
): Promise<PendingExamDetail> => {
  const response = await backendRequest<PendingExamDetailSchema>(buildExamUrl(examId, "/reject"), {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return ensureExamDetail(response, "El backend no devolvió el examen rechazado");
};
