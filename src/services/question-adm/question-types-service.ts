import type {
  CreateQuestionTypePayload,
  QuestionTypeDetail,
} from "@/types/question_administration";
import {
  QUESTION_TYPES_ENDPOINT,
  USE_MOCK_QUESTION_ADMIN,
  randomId,
  request,
  unwrap,
} from "./common";

const cloneQuestionTypes = (types: QuestionTypeDetail[]) =>
  types.map((type) => ({ ...type }));

let mockQuestionTypes: QuestionTypeDetail[] = [
  { question_type_id: "type-1", question_type_name: "Ensayo" },
  { question_type_id: "type-2", question_type_name: "Selección Múltiple" },
  { question_type_id: "type-3", question_type_name: "Verdadero / Falso" },
];

export const fetchQuestionTypes = async (): Promise<QuestionTypeDetail[]> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    return cloneQuestionTypes(mockQuestionTypes);
  }
  const resp = await request<unknown>(QUESTION_TYPES_ENDPOINT);
  return unwrap<QuestionTypeDetail[]>(resp);
};

export const createQuestionType = async (
  payload: CreateQuestionTypePayload
): Promise<QuestionTypeDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const newType: QuestionTypeDetail = {
      question_type_id: randomId(),
      question_type_name: payload.question_type_name,
    };
    mockQuestionTypes = [...mockQuestionTypes, newType];
    return newType;
  }
  const resp = await request<unknown>(QUESTION_TYPES_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return unwrap<QuestionTypeDetail>(resp);
};

export const deleteQuestionType = async (
  questionTypeId: string
): Promise<void> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    mockQuestionTypes = mockQuestionTypes.filter(
      (type) => type.question_type_id !== questionTypeId
    );
    return;
  }
  await request<void>(`${QUESTION_TYPES_ENDPOINT}/${questionTypeId}`, {
    method: "DELETE",
  });
};
