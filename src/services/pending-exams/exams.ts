import type { PaginationMeta, RetrieveOneSchema } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import { PENDING_EXAMS_ENDPOINT, withQueryParams } from "@/services/api/endpoints";
import type { PendingExamDetail, PendingExamListItem } from "@/types/pending-exams/exam";

export type ListPendingExamsQuery = {
  q?: string;
  subjectId?: string;
  teacherId?: string;
  status?: string;
  limit?: number;
  offset?: number;
};

type PendingExamListSchema = {
  success: boolean;
  message: string;
  data: PendingExamListItem[];
  meta: PaginationMeta;
};

type PendingExamDetailSchema = RetrieveOneSchema<PendingExamDetail>;

const ensureExamDetail = (schema: PendingExamDetailSchema, fallbackMessage: string) => {
  if (!schema.data) {
    throw new Error(fallbackMessage);
  }
  return schema.data;
};

export const fetchPendingExams = async (params: ListPendingExamsQuery = {}) => {
  const url = withQueryParams(PENDING_EXAMS_ENDPOINT, {
    q: params.q,
    subjectId: params.subjectId,
    teacherId: params.teacherId,
    status: params.status,
    limit: params.limit,
    offset: params.offset,
  });
  const response = await backendRequest<PendingExamListSchema>(url);
  return { data: response.data ?? [], meta: response.meta };
};

export const fetchPendingExamDetail = async (examId: string): Promise<PendingExamDetail> => {
  const response = await backendRequest<PendingExamDetailSchema>(`${PENDING_EXAMS_ENDPOINT}/${examId}`);
  return ensureExamDetail(response, "El backend no devolvi\u00F3 el detalle del examen solicitado");
};

export type ApprovePendingExamPayload = {
  comment?: string;
};

export const approvePendingExam = async (
  examId: string,
  payload: ApprovePendingExamPayload = {},
): Promise<PendingExamDetail> => {
  const response = await backendRequest<PendingExamDetailSchema>(`${PENDING_EXAMS_ENDPOINT}/${examId}/approve`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return ensureExamDetail(response, "El backend no devolvi\u00F3 el examen aprobado");
};

export type RejectPendingExamPayload = {
  comment?: string;
};

export const rejectPendingExam = async (
  examId: string,
  payload: RejectPendingExamPayload = {},
): Promise<PendingExamDetail> => {
  const response = await backendRequest<PendingExamDetailSchema>(`${PENDING_EXAMS_ENDPOINT}/${examId}/reject`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return ensureExamDetail(response, "El backend no devolvi\u00F3 el examen rechazado");
};
