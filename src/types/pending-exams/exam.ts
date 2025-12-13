import type { QuestionOption } from "@/types/question-bank/question";

export type PendingExamStatus = "pendiente" | "aprobado" | "rechazado";

export type PendingExamDifficulty = "F\u00E1cil" | "Regular" | "Dif\u00EDcil" | "Mixta";

export type PendingExamQuestion = {
  id: string;
  questionId?: string;
  body: string;
  type: string;
  difficulty: PendingExamDifficulty;
  subtopic: string;
  response?: string | null;
  options?: (QuestionOption | string)[] | null;
};

export type PendingExamListItem = {
  id: string;
  examName: string;
  subject: string;
  subjectId?: string;
  creator: string;
  creatorId?: string;
  createdDate: string;
  status: PendingExamStatus;
  difficulty: PendingExamDifficulty;
  totalQuestions: number;
};

export type PendingExamDetail = PendingExamListItem & {
  questions: PendingExamQuestion[];
  approvalComment?: string | null;
  rejectionComment?: string | null;
};

export type PendingExamFilters = {
  professorId: string;
};

export type PendingExamFilterOption = {
  value: string;
  label: string;
};
