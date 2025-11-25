import type { PaginationMeta } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import { EXAMS_ENDPOINT, withQueryParams } from "@/services/api/endpoints";
import type { ExamDetail } from "@/types/exam-bank/exam";

export type ListExamsQuery = {
  subjectId?: string;
  difficulty?: string;
  examStatus?: string;
  authorId?: string;
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

export const fetchExams = async (params: ListExamsQuery = {}): Promise<ExamListResult> => {
  const url = withQueryParams(EXAMS_ENDPOINT, {
    subjectId: params.subjectId,
    difficulty: params.difficulty,
    examStatus: params.examStatus,
    authorId: params.authorId,
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
