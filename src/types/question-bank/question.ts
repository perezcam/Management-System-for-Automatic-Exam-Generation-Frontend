import { DifficultyLevelEnum } from "./enums/difficultyLevel";

export type QuestionDetail = {
    id: string;
    author_id: string;
    subtopic_id: string;
    body: string;
    expected_response: string | null;
    difficulty: DifficultyLevelEnum;
    options: Array<{ text: string; isCorrect: boolean }> | null;
}

export type CreateQuestionPayload = {
    subtopic_id: string;
    body: string;
    expected_response: string | null;
    difficulty: DifficultyLevelEnum;
    options: Array<{ text: string; isCorrect: boolean }> | null;
}

export type UpdateQuestionPayload = Partial<CreateQuestionPayload>;
