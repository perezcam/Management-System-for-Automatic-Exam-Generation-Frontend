import type { BaseResponse, RetrieveManySchema, RetrieveOneSchema } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import { QUESTION_TYPES_ENDPOINT } from "@/services/api/endpoints";
import { CreateQuestionTypePayload, QuestionTypeDetail } from "@/types/question-administration/question-type";

export const fetchQuestionTypes = async (): Promise<QuestionTypeDetail[]> => {
  const resp = await backendRequest<RetrieveManySchema<QuestionTypeDetail>>(QUESTION_TYPES_ENDPOINT);
  return resp.data;
};

export const createQuestionType = async (payload: CreateQuestionTypePayload): Promise<QuestionTypeDetail> => {
  const resp = await backendRequest<RetrieveOneSchema<QuestionTypeDetail>>(QUESTION_TYPES_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!resp.data) {
    throw new Error("El backend no devolvió el tipo de pregunta creado");
  }
  return resp.data;
};

export const deleteQuestionType = async (questionTypeId: string): Promise<void> => {
  await backendRequest<BaseResponse>(`${QUESTION_TYPES_ENDPOINT}/${questionTypeId}`, { method: "DELETE" });
};
