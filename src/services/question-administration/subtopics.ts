import type { CreateSubtopicPayload, SubTopicDetail } from "@/types/question-administration/question_administration";
import type { BaseResponse, RetrieveOneSchema } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import { QUESTION_SUBTOPICS_ENDPOINT } from "@/services/api/endpoints";

export const createSubtopic = async (payload: CreateSubtopicPayload): Promise<SubTopicDetail> => {
  const resp = await backendRequest<RetrieveOneSchema<SubTopicDetail>>(QUESTION_SUBTOPICS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!resp.data) {
    throw new Error("El backend no devolvió el subtema creado");
  }
  return resp.data;
};

export const deleteSubtopic = async (subtopicId: string): Promise<void> => {
  await backendRequest<BaseResponse>(`${QUESTION_SUBTOPICS_ENDPOINT}/${subtopicId}`, { method: "DELETE" });
};
