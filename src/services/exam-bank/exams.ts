import type { BaseResponse, PaginationMeta, RetrieveOneSchema } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import { EXAMS_AUTOMATIC_ENDPOINT, EXAMS_ENDPOINT, EXAMS_MANUAL_ENDPOINT, withQueryParams } from "@/services/api/endpoints";
import type {
  CreateAutomaticExamPayload,
  CreateManualExamPayload,
  ExamDetail,
  UpdateExamPayload,
  AutomaticExamPreview,
} from "@/types/exam-bank/exam";

export type ListExamsQuery = {
  subjectId?: string;
  difficulty?: string;
  examStatus?: string;
  authorId?: string;
  validatorId?: string;
  title?: string;
  limit?: number;
  offset?: number;
};

export type ListExamsResponse = {
  success: boolean;
  message: string;
  data: ExamDetail[];
  meta: PaginationMeta;
};

export type ExamListResult = {
  data: ExamDetail[];
  meta: PaginationMeta;
};

export type RetrieveExamResponse = RetrieveOneSchema<ExamDetail>;

export const fetchExams = async (params: ListExamsQuery = {}): Promise<ExamListResult> => {
  const url = withQueryParams(EXAMS_ENDPOINT, {
    subjectId: params.subjectId,
    difficulty: params.difficulty,
    examStatus: params.examStatus,
    authorId: params.authorId,
    validatorId: params.validatorId,
    title: params.title,
    limit: params.limit,
    offset: params.offset,
  });

  const resp = await backendRequest<ListExamsResponse>(url);
  return {
    data: resp.data ?? [],
    meta: resp.meta,
  };
};

export const fetchExamById = async (examId: string): Promise<ExamDetail> => {
  const resp = await backendRequest<RetrieveExamResponse>(`${EXAMS_ENDPOINT}/${examId}`);
  if (!resp.data) {
    throw new Error("El backend no devolvió el examen solicitado");
  }
  return resp.data;
};

export const updateExam = async (examId: string, payload: UpdateExamPayload): Promise<ExamDetail> => {
  const resp = await backendRequest<RetrieveExamResponse>(`${EXAMS_ENDPOINT}/${examId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!resp.data) {
    throw new Error("El backend no devolvió el examen actualizado");
  }
  return resp.data;
};

export const deleteExam = async (examId: string): Promise<void> => {
  await backendRequest<BaseResponse>(`${EXAMS_ENDPOINT}/${examId}`, {
    method: "DELETE",
  });
};

export const createManualExam = async (payload: CreateManualExamPayload): Promise<ExamDetail> => {
  const resp = await backendRequest<RetrieveExamResponse>(EXAMS_MANUAL_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!resp.data) {
    throw new Error("El backend no devolvió el examen creado");
  }
  return resp.data;
};

export const createAutomaticExam = async (payload: CreateAutomaticExamPayload): Promise<AutomaticExamPreview> => {
  const resp = await backendRequest<RetrieveOneSchema<AutomaticExamPreview>>(EXAMS_AUTOMATIC_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!resp.data) {
    throw new Error("El backend no devolvió la previsualización del examen");
  }
  return resp.data;
};

export const sendExamForReview = async (examId: string): Promise<ExamDetail> => {
  const resp = await backendRequest<RetrieveExamResponse>(
    `${EXAMS_ENDPOINT}/${examId}/request-review`,
    {
      method: "PATCH",
    }
  );
  if (!resp.data) {
    throw new Error("El backend no devolvió el examen actualizado");
  }
  return resp.data;
};
