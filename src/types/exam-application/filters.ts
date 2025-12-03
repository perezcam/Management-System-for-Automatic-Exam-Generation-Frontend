import { AssignedExamStatus } from "./exam";

export interface StudentExamFilters {
    status: AssignedExamStatus | "ALL";
    subjectId: string | "ALL";
    teacherId: string | "ALL";
}
