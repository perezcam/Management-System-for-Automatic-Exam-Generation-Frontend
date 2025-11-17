import type { BaseResponse, RetrieveManySchema, RetrieveOneSchema } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import { QUESTION_TOPICS_ENDPOINT, withQueryParams } from "@/services/api/endpoints";
import { CreateTopicPayload, TopicDetail, UpdateTopicPayload } from "@/types/question-administration/topic";

const normalizeTopic = (topic: TopicDetail): TopicDetail => {
  const subtopics = topic.subtopics ?? [];
  return {
    ...topic,
    subtopics,
    subtopics_amount: subtopics.length,
  };
};

export type TopicQueryParams = {
  q?: string;
};

export const fetchTopics = async (params?: TopicQueryParams): Promise<TopicDetail[]> => {
  const url = withQueryParams(QUESTION_TOPICS_ENDPOINT, {
    q: params?.q,
  });
  const resp = await backendRequest<RetrieveManySchema<TopicDetail>>(url);
  const topics = resp.data;
  return topics.map(normalizeTopic);
};

export const createTopic = async (payload: CreateTopicPayload): Promise<TopicDetail> => {
  const resp = await backendRequest<RetrieveOneSchema<TopicDetail>>(QUESTION_TOPICS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const created = resp.data;
  if (!created) {
    throw new Error("El backend no devolvió el tópico creado");
  }
  return normalizeTopic(created);
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
  return normalizeTopic(updated);
};

export const deleteTopic = async (topicId: string): Promise<void> => {
  await backendRequest<BaseResponse>(`${QUESTION_TOPICS_ENDPOINT}/${topicId}`, { method: "DELETE" });
};
