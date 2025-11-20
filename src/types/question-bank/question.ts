import { DifficultyLevelEnum } from "./enums/difficultyLevel";

export type QuestionOption = {
  text: string;
  isCorrect: boolean;
};

export type QuestionDetail = {
  questionId: string;
  authorId: string;
  questionTypeId: string;
  subtopicId: string;
  body: string;
  difficulty: DifficultyLevelEnum;
  options: QuestionOption[] | null;
  response: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateQuestionPayload = {
  subtopicId: string;
  questionTypeId: string;
  body: string;
  response: string | null;
  difficulty: DifficultyLevelEnum;
  options: QuestionOption[] | null;
};

export type UpdateQuestionPayload = Partial<CreateQuestionPayload>;
