import type {
  BaseResponse,
  PaginatedSchema,
  PaginationMeta,
  PaginationParams,
  RetrieveManySchema,
  RetrieveOneSchema,
} from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import { PaginatedResult, QUESTION_TOPICS_ENDPOINT, withQueryParams } from "@/services/api/endpoints";
import { CreateTopicPayload, TopicDetail, UpdateTopicPayload } from "@/types/question-administration/topic";

const normalizeTopic = (topic: TopicDetail): TopicDetail => {
  const subtopics = topic.subtopics ?? [];
  return {
    ...topic,
    subtopics,
    subtopics_amount: subtopics.length,
  };
};

export const MAX_TOPICS_LIMIT = 100;

export type TopicQueryParams = PaginationParams & {
  q?: string;
};

type TopicListResponse = PaginatedSchema<TopicDetail> | RetrieveManySchema<TopicDetail>;

const buildMeta = (payload: TopicListResponse, params: TopicQueryParams): PaginationMeta => {
  if ("meta" in payload && payload.meta) {
    return payload.meta;
  }
  const fallbackTotal = Array.isArray(payload.data) ? payload.data.length : 0;
  return {
    limit: params.limit ?? fallbackTotal,
    offset: params.offset ?? 0,
    total: fallbackTotal,
  };
};

export const fetchTopics = async (params: TopicQueryParams = {}): Promise<PaginatedResult<TopicDetail>> => {
  const safeLimit =
    typeof params.limit === "number"
      ? Math.min(params.limit, MAX_TOPICS_LIMIT)
      : params.limit;
  const url = withQueryParams(QUESTION_TOPICS_ENDPOINT, {
    q: params?.q,
    limit: safeLimit,
    offset: params.offset,
  });
  const resp = await backendRequest<TopicListResponse>(url);
  const topics = resp.data ?? [];
  return {
    data: topics.map(normalizeTopic),
    meta: buildMeta(resp, { ...params, limit: safeLimit }),
  };
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
