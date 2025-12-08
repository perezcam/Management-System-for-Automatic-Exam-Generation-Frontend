import { AssignedExamStatus } from "./exam";

export type EvaluatorAssignment = {
  id: string;
  examId: string;
  examTitle: string;
  subjectId: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  status: AssignedExamStatus | "IN_REVIEW";
  grade: number | null;
  applicationDate?: string;
};

export const PendingRegradeRequestStatus = {
  REQUESTED: "REQUESTED",
  IN_REVIEW: "IN_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type PendingRegradeRequestStatus = typeof PendingRegradeRequestStatus[keyof typeof PendingRegradeRequestStatus];

export type PendingRegradeRequest = {
  id: string;
  examAssignmentId: string;
  examId: string;
  examTitle: string;
  subjectId: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  reason: string;
  status: PendingRegradeRequestStatus;
  grade: number | null;
  createdAt?: string;
  requestedAt?: string;
  assignmentId?: string;
};

export type GradingTargetType = "GRADE" | "REGRADE";

export type GradingTarget = {
  type: GradingTargetType;
  assignmentId: string;
  examId: string;
  examTitle: string;
  subjectId: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  status: string;
  grade: number | null;
  requestedAt?: string;
  requestReason?: string;
};
