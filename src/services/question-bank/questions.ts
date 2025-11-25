import type { BaseResponse, PaginationMeta, RetrieveOneSchema } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import { QUESTION_BANK_QUESTIONS_ENDPOINT, withQueryParams } from "@/services/api/endpoints";
import { CreateQuestionPayload, QuestionDetail, UpdateQuestionPayload } from "@/types/question-bank/question";
import { DifficultyLevelEnum } from "@/types/question-bank/enums/difficultyLevel";

export type ListQuestionsQuery = {
  q?: string;
  subtopicId?: string;
  authorId?: string;
  difficulty?: DifficultyLevelEnum;
  questionTypeId?: string;
  limit?: number;
  offset?: number;
};

export type ListQuestionsResponse = {
  success: boolean;
  message: string;
  data: QuestionDetail[];
  meta: PaginationMeta;
};

export type QuestionListResult = {
  data: QuestionDetail[];
  meta: PaginationMeta;
};

export type RetrieveQuestionResponse = RetrieveOneSchema<QuestionDetail>;

export const fetchQuestions = async (params: ListQuestionsQuery = {}): Promise<QuestionListResult> => {
  const url = withQueryParams(QUESTION_BANK_QUESTIONS_ENDPOINT, {
    q: params.q,
    subtopicId: params.subtopicId,
    authorId: params.authorId,
    difficulty: params.difficulty,
    questionTypeId: params.questionTypeId,
    limit: params.limit,
    offset: params.offset,
  });

  const resp = await backendRequest<ListQuestionsResponse>(url);
  return {
    data: resp.data ?? [],
    meta: resp.meta,
  };
};

export const fetchQuestionById = async (questionId: string): Promise<QuestionDetail> => {
  const resp = await backendRequest<RetrieveQuestionResponse>(`${QUESTION_BANK_QUESTIONS_ENDPOINT}/${questionId}`);
  if (!resp.data) {
    throw new Error("El backend no devolvió la pregunta solicitada");
  }
  return resp.data;
};

export const createQuestion = async (payload: CreateQuestionPayload): Promise<QuestionDetail> => {
  const resp = await backendRequest<RetrieveQuestionResponse>(QUESTION_BANK_QUESTIONS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!resp.data) {
    throw new Error("El backend no devolvió la pregunta creada");
  }
  return resp.data;
};

export const updateQuestion = async (
  questionId: string,
  payload: UpdateQuestionPayload,
): Promise<QuestionDetail> => {
  const resp = await backendRequest<RetrieveQuestionResponse>(`${QUESTION_BANK_QUESTIONS_ENDPOINT}/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!resp.data) {
    throw new Error("El backend no devolvió la pregunta actualizada");
  }
  return resp.data;
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  await backendRequest<BaseResponse>(`${QUESTION_BANK_QUESTIONS_ENDPOINT}/${questionId}`, {
    method: "DELETE",
  });
};
