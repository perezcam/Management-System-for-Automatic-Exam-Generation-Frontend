export type PendingExamStatus = "pendiente" | "aprobado" | "rechazado";

export type PendingExamDifficulty = "F\u00E1cil" | "Regular" | "Dif\u00EDcil" | "Mixta";

export type PendingExamQuestion = {
  id: string;
  body: string;
  type: string;
  difficulty: PendingExamDifficulty;
  subtopic: string;
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
  subjectId: string;
  status: string;
};

export type PendingExamFilterOption = {
  value: string;
  label: string;
};
