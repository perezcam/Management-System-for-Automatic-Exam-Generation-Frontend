import type { PaginationMeta, RetrieveOneSchema } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import { PENDING_EXAMS_ENDPOINT } from "@/services/api/endpoints";
import { fetchExams } from "@/services/exam-bank/exams";
import type { ExamDetail } from "@/types/exam-bank/exam";
import type {
  PendingExamDetail,
  PendingExamDifficulty,
  PendingExamListItem,
  PendingExamQuestion,
  PendingExamStatus,
} from "@/types/pending-exams/exam";
import type { QuestionOption } from "@/types/question-bank/question";

export type ListPendingExamsQuery = {
  title?: string;
  subjectId?: string;
  authorId?: string;
  examStatus?: PendingExamStatus | string;
  validatorId?: string;
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

type PendingExamQuestionOptionApi =
  | string
  | {
      text?: string;
      label?: string;
      value?: string;
      statement?: string;
      option?: string;
      description?: string;
      body?: string;
      isCorrect?: boolean;
      correct?: boolean;
      is_correct?: boolean;
      answer?: boolean;
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
  questionId?: string;
  question_id?: string;
  response?: string | null;
  options?: PendingExamQuestionOptionApi[];
};

type PendingExamDetailApi = PendingExamListItemApi & {
  approvalComment?: string | null;
  rejectionComment?: string | null;
  observations?: string | null;
  questions?: PendingExamQuestionApi[];
};

const STATUS_TO_BACKEND = new Map<PendingExamStatus, string>([
  ["pendiente", "on_review"],
  ["aprobado", "valid"],
  ["rechazado", "invalid"],
]);

const STATUS_FROM_BACKEND = new Map<string, PendingExamStatus>([
  ["draft", "pendiente"],
  ["pending", "pendiente"],
  ["on_review", "pendiente"],
  ["valid", "aprobado"],
  ["approved", "aprobado"],
  ["published", "aprobado"],
  ["invalid", "rechazado"],
  ["rejected", "rechazado"],
]);

const DIFFICULTY_FROM_BACKEND = new Map<string, PendingExamDifficulty>([
  ["easy", "Fácil"],
  ["medium", "Regular"],
  ["hard", "Difícil"],
  ["mixed", "Mixta"],
]);

const VALIDATOR_ALLOWED_BACKEND_STATUSES = ["on_review"] as const;

const mapExamStatusParam = (status?: string) => {
  if (!status) return undefined;
  const normalized = status.toLowerCase();
  return STATUS_TO_BACKEND.get(normalized as PendingExamStatus) ?? status;
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

const formatDateLabel = (value?: string): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-ES");
};

const normalizePendingExamQuestionOptions = (
  options?: PendingExamQuestionOptionApi[],
): (QuestionOption | string)[] | null => {
  if (!options?.length) {
    return null;
  }

  const normalized = options
    .map((option) => {
      if (typeof option === "string") {
        const trimmed = option.trim();
        return trimmed ? trimmed : null;
      }
      if (!option) {
        return null;
      }

      const text =
        option.text ??
        option.label ??
        option.value ??
        option.statement ??
        option.option ??
        option.description ??
        option.body ??
        "";

      if (!text) {
        return null;
      }

      const isCorrectValue =
        typeof option.isCorrect === "boolean"
          ? option.isCorrect
          : typeof option.correct === "boolean"
            ? option.correct
            : typeof option.is_correct === "boolean"
              ? option.is_correct
              : typeof option.answer === "boolean"
                ? option.answer
                : undefined;

      if (typeof isCorrectValue === "boolean") {
        return {
          text,
          isCorrect: isCorrectValue,
        };
      }

      return text;
    })
    .filter((option): option is QuestionOption | string => Boolean(option));

  return normalized.length ? normalized : null;
};

const mapPendingExamQuestion = (question: PendingExamQuestionApi): PendingExamQuestion => {
  const options = normalizePendingExamQuestionOptions(question.options);
  return {
    id: question.id,
    questionId: question.questionId ?? question.question_id ?? question.id,
    body: question.body ?? question.statement ?? question.enunciado ?? question.text ?? "",
    type: question.type ?? question.questionType ?? "",
    difficulty: mapExamDifficultyResponse(question.difficulty),
    subtopic: question.subtopic ?? question.subtopicName ?? "",
    response: question.response ?? null,
    options,
  };
};

const mapPendingExamListItem = (exam: PendingExamListItemApi): PendingExamListItem => ({
  id: exam.id,
  examName: exam.title ?? exam.examName ?? "Examen sin título",
  subject: exam.subject ?? exam.subjectName ?? exam.subjectId ?? "",
  subjectId: exam.subjectId,
  creator: exam.author ?? exam.authorName ?? exam.creator ?? exam.authorId ?? "",
  creatorId: exam.authorId ?? exam.creatorId,
  createdDate: formatDateLabel(exam.createdAt ?? exam.createdDate),
  status: mapExamStatusResponse(exam.examStatus),
  difficulty: mapExamDifficultyResponse(exam.difficulty),
  totalQuestions: exam.questionCount ?? exam.totalQuestions ?? 0,
});

const mapExamBankListItem = (exam: ExamDetail): PendingExamListItem => ({
  id: exam.id,
  examName: exam.title ?? "Examen sin título",
  subject: exam.subjectId ?? "",
  subjectId: exam.subjectId,
  creator: exam.authorId ?? "",
  creatorId: exam.authorId,
  createdDate: formatDateLabel(exam.createdAt),
  status: mapExamStatusResponse(exam.examStatus),
  difficulty: mapExamDifficultyResponse(exam.difficulty),
  totalQuestions: exam.questionCount ?? 0,
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

type PendingExamDetailSchema = RetrieveOneSchema<PendingExamDetailApi>;

const ensureExamDetail = (schema: PendingExamDetailSchema, fallbackMessage: string) => {
  if (!schema.data) {
    throw new Error(fallbackMessage);
  }
  return mapPendingExamDetail(schema.data);
};

export const fetchPendingExams = async (params: ListPendingExamsQuery = {}) => {
  const defaultExamStatus =
    params.validatorId && !params.examStatus ? VALIDATOR_ALLOWED_BACKEND_STATUSES[0] : undefined;
  const examStatusParam = params.examStatus ?? defaultExamStatus;

  const { data, meta } = await fetchExams({
    title: params.title,
    subjectId: params.subjectId,
    authorId: params.authorId,
    examStatus: mapExamStatusParam(examStatusParam),
    validatorId: params.validatorId,
    limit: params.limit,
    offset: params.offset,
  });

  const allowedStatuses = params.validatorId ? VALIDATOR_ALLOWED_BACKEND_STATUSES : null;
  const filtered = data.filter((exam) => {
    const matchesValidator = params.validatorId ? exam.validatorId === params.validatorId : true;
    const normalizedStatus = exam.examStatus?.toLowerCase() ?? "";
    const matchesAllowedStatuses = allowedStatuses ? allowedStatuses.includes(normalizedStatus) : true;
    return matchesValidator && matchesAllowedStatuses;
  });

  const items = filtered.map(mapExamBankListItem);

  const baseTotal =
    typeof meta?.total === "number" && Number.isFinite(meta.total) ? meta.total : filtered.length;

  const pagination: PaginationMeta = {
    limit: meta?.limit ?? params.limit ?? filtered.length,
    offset: meta?.offset ?? params.offset ?? 0,
    total: baseTotal,
  };

  return {
    data: items,
    meta: pagination,
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
  const response = await backendRequest<PendingExamDetailSchema>(buildExamUrl(examId, "/accept"), {
    method: "PATCH",
    body: JSON.stringify({
      comment: payload.comment,
    }),
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
    method: "PATCH",
    body: JSON.stringify({
      comment: payload.comment,
    }),
  });
  return ensureExamDetail(response, "El backend no devolvió el examen rechazado");
};
