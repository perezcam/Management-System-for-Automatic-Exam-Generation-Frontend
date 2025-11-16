import type { CreateTopicPayload, TopicDetail, UpdateTopicPayload } from "@/types/question_administration";
import type { BaseResponse, RetrieveOneSchema } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import { QUESTION_TOPICS_ENDPOINT } from "@/services/api/endpoints";

export const createTopic = async (payload: CreateTopicPayload): Promise<TopicDetail> => {
  const resp = await backendRequest<RetrieveOneSchema<TopicDetail>>(QUESTION_TOPICS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const created = resp.data;
  if (!created) {
    throw new Error("El backend no devolvió el tópico creado");
  }
  return {
    ...created,
    subtopics: created.subtopics.map((subtopic) => ({ ...subtopic })),
  };
};

export const updateTopic = async (topicId: string, payload: UpdateTopicPayload): Promise<TopicDetail> => {
  const resp = await backendRequest<RetrieveOneSchema<TopicDetail>>(`${QUESTION_TOPICS_ENDPOINT}/${topicId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const updated = resp.data;
  if (!updated) {
    throw new Error("El backend no devolvió el tópico actualizado");
  }
  return {
    ...updated,
    subtopics: updated.subtopics.map((subtopic) => ({ ...subtopic })),
  };
};

export const deleteTopic = async (topicId: string): Promise<void> => {
  await backendRequest<BaseResponse>(`${QUESTION_TOPICS_ENDPOINT}/${topicId}`, { method: "DELETE" });
};
