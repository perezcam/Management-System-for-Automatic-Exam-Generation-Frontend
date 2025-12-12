import type { QuestionOption } from "@/types/question-bank/question";

export type ExamQuestionListItem = {
  id: string;
  body: string;
  type?: string;
  difficulty?: string;
  subtopic?: string;
  response?: string | null;
  options?: (QuestionOption | string)[] | null;
};
