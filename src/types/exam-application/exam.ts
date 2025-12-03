import { DifficultyLevelEnum } from "../question-bank/enums/difficultyLevel";

export enum AssignedExamStatus {
    PENDING = "PENDING",
    ENABLED = "ENABLED",
    IN_EVALUATION = "IN_EVALUATION",
    GRADED = "GRADED"
}

export interface ExamAssignment {
    id: string;
    examId: string;
    subjectId: string;
    subjectName: string;
    title?: string;
    examTitle?: string;
    teacherId: string;
    teacherName: string;
    status: AssignedExamStatus;
    applicationDate: string; // Date string
    durationMinutes: number;
    grade: number | null;
}

export type ExamResponseOption = {
    text: string;
    isCorrect: boolean;
};

export interface ExamResponseCreateInput {
    examId: string;
    examQuestionId: string;
    selectedOptions?: ExamResponseOption[] | null;
    textAnswer?: string | null;
}

export interface ExamResponseUpdateInput {
    selectedOptions?: ExamResponseOption[] | null;
    textAnswer?: string | null;
}

export interface ExamResponse {
    id: string;
    examAssignmentId: string;
    questionId: string;
    selectedOptions: ExamResponseOption[];
    textAnswer: string | null;
    textResponse?: string | null;
    autoPoints: number;
    manualPoints: number | null;
    feedback: string | null;
    answeredAt: string;
}

export interface ActiveExamQuestion {
    questionId: string;
    questionIndex: number;
    questionScore: number;
    id: string;
    examId: string;
}

export interface ActiveExam {
    id: string;
    title: string;
    subjectId: string;
    difficulty: DifficultyLevelEnum;
    examStatus: string;
    authorId: string;
    validatorId: string;
    observations?: string;
    questionCount: number;
    topicProportion: Record<string, number>;
    topicCoverage: {
        mode: string;
        topicIds: string[];
        subjectId: string;
        difficulty: string;
        questionIds: string[];
    };
    validatedAt: string;
    createdAt: string;
    updatedAt: string;
    questions: ActiveExamQuestion[];
}
