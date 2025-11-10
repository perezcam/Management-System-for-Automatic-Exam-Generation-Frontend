import type { CreateQuestionTypePayload, QuestionTypeDetail } from "@/types/question-bank/question-type";
import {
  QUESTION_TYPES_ENDPOINT,
  USE_MOCK_QUESTION_ADMIN,
  cloneQuestionTypes,
  createRandomId,
  readMockQuestionTypes,
  request,
  updateMockQuestionTypes,
} from "./base";

export const fetchQuestionTypes = async (): Promise<QuestionTypeDetail[]> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    return cloneQuestionTypes(readMockQuestionTypes());
  }
  return request<QuestionTypeDetail[]>(QUESTION_TYPES_ENDPOINT);
};

export const createQuestionType = async (payload: CreateQuestionTypePayload): Promise<QuestionTypeDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const newType: QuestionTypeDetail = {
      question_type_id: createRandomId(),
      question_type_name: payload.question_type_name,
    };
    updateMockQuestionTypes((types) => [...types, newType]);
    return newType;
  }
  return request<QuestionTypeDetail>(QUESTION_TYPES_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const deleteQuestionType = async (questionTypeId: string): Promise<void> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    updateMockQuestionTypes((types) => types.filter((type) => type.question_type_id !== questionTypeId));
    return;
  }
  await request<void>(`${QUESTION_TYPES_ENDPOINT}/${questionTypeId}`, { method: "DELETE" });
};
