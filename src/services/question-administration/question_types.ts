import { QUESTION_TYPES_ENDPOINT, withQueryParams } from "@/services/api/endpoints";
import type { PaginationMeta } from "@/types/backend-responses";
import { CreateQuestionTypePayload, QuestionTypeDetail } from "@/types/question-administration/question-type";
import { showErrorToast } from "@/utils/toast";

export type QuestionTypeName = "MCQ" | "TRUE_FALSE" | "ESSAY";

type QuestionTypeListResponse = {
  items?: QuestionTypeDetail[];
  data?: QuestionTypeDetail[];
  meta: PaginationMeta;
};

type QuestionTypeListParams = {
  name?: QuestionTypeName;
  limit?: number;
  offset?: number;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // ignore JSON parse errors, we will fallback to status text
  }

  if (!response.ok) {
    const message =
      (typeof payload === "object" &&
        payload !== null &&
        "message" in payload &&
        typeof (payload as { message?: unknown }).message === "string" &&
        (payload as { message: string }).message) ||
      response.statusText ||
      `Error ${response.status}`;
    showErrorToast(message);
    throw new Error(message);
  }

  return payload as T;
};

export const fetchQuestionTypes = async (params: QuestionTypeListParams = {}): Promise<QuestionTypeDetail[]> => {
  const url = withQueryParams(QUESTION_TYPES_ENDPOINT, {
    name: params.name,
    limit: params.limit,
    offset: params.offset,
  });

  const resp = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  const payload = await handleResponse<QuestionTypeListResponse>(resp);
  const items = payload.items ?? payload.data ?? [];
  return items;
};

export const createQuestionType = async (payload: CreateQuestionTypePayload): Promise<QuestionTypeDetail> => {
  const resp = await fetch(QUESTION_TYPES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const responsePayload = await handleResponse<QuestionTypeDetail | { data?: QuestionTypeDetail }>(resp);
  return (typeof responsePayload === "object" && responsePayload !== null && "data" in responsePayload && responsePayload.data)
    ? (responsePayload.data as QuestionTypeDetail)
    : (responsePayload as QuestionTypeDetail);
};

export const deleteQuestionType = async (questionTypeId: string): Promise<void> => {
  const resp = await fetch(`${QUESTION_TYPES_ENDPOINT}/${questionTypeId}`, {
    method: "DELETE",
    credentials: "include",
  });
  await handleResponse<undefined>(resp);
};

export const fetchQuestionTypeDetail = async (questionTypeId: string): Promise<QuestionTypeDetail> => {
  const resp = await fetch(`${QUESTION_TYPES_ENDPOINT}/${questionTypeId}`, {
    method: "GET",
    credentials: "include",
  });
  const payload = await handleResponse<QuestionTypeDetail | { data?: QuestionTypeDetail }>(resp);
  return (typeof payload === "object" && payload !== null && "data" in payload && payload.data)
    ? (payload.data as QuestionTypeDetail)
    : (payload as QuestionTypeDetail);
};

export const updateQuestionType = async (
  questionTypeId: string,
  payload: Partial<CreateQuestionTypePayload>,
): Promise<QuestionTypeDetail> => {
  const resp = await fetch(`${QUESTION_TYPES_ENDPOINT}/${questionTypeId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const responsePayload = await handleResponse<QuestionTypeDetail | { data?: QuestionTypeDetail }>(resp);
  return (typeof responsePayload === "object" && responsePayload !== null && "data" in responsePayload && responsePayload.data)
    ? (responsePayload.data as QuestionTypeDetail)
    : (responsePayload as QuestionTypeDetail);
};
