import { backendRequest } from "@/services/api-client";
import {
    ActiveExam,
    ExamAssignment,
    ExamResponse,
    ExamResponseCreateInput,
    ExamResponseUpdateInput
} from "@/types/exam-application/exam";
import { StudentExamFilters } from "@/types/exam-application/filters";
import { BaseResponse } from "@/types/backend-responses";
import {
    EXAMS_ENDPOINT,
    STUDENT_ASSIGNMENTS_ENDPOINT,
    EXAM_RESPONSES_ENDPOINT
} from "@/services/api/endpoints";
import { extractBackendMessage } from "@/utils/backend-response";
import { showErrorToast } from "@/utils/toast";


interface ListStudentExamsResponse extends BaseResponse {
    data: ExamAssignment[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface GetExamResponse extends BaseResponse {
    data: ActiveExam;
}

interface ExamResponseSuccessResponse extends BaseResponse {
    data: ExamResponse;
}

export type AssignExamToCoursePayload = {
    studentIds: string[];
    applicationDate: string;
    durationMinutes: number;
    examId: string;
    currentUserId: string;
};

interface AssignExamToCourseResponse extends BaseResponse {
    data?: unknown;
}

type ListStudentExamsParams = StudentExamFilters & {
    page: number;
    limit: number;
    examTitle?: string;
};

export const ExamApplicationService = {
    listStudentExams: async (
        params: ListStudentExamsParams
    ) => {
        const queryParams = new URLSearchParams();
        queryParams.append("page", params.page.toString());
        queryParams.append("limit", params.limit.toString());

        if (params.status !== "ALL") queryParams.append("status", params.status);
        if (params.subjectId !== "ALL") queryParams.append("subjectId", params.subjectId);
        if (params.teacherId !== "ALL") queryParams.append("teacherId", params.teacherId);
        if (params.examTitle) queryParams.append("examTitle", params.examTitle);

        return backendRequest<ListStudentExamsResponse>(
            `${STUDENT_ASSIGNMENTS_ENDPOINT}?${queryParams.toString()}`
        );
    },

    getExam: async (examId: string) => {
        return backendRequest<GetExamResponse>(`${EXAMS_ENDPOINT}/${examId}`);
    },

    submitResponse: async (response: ExamResponseCreateInput) => {
        return backendRequest<ExamResponseSuccessResponse>(EXAM_RESPONSES_ENDPOINT, {
            method: "POST",
            body: JSON.stringify(response),
        });
    },

    updateResponse: async (responseId: string, response: ExamResponseUpdateInput) => {
        return backendRequest<ExamResponseSuccessResponse>(
            `${EXAM_RESPONSES_ENDPOINT}/${responseId}`,
            {
                method: "PUT",
                body: JSON.stringify(response),
            }
        );
    },

    assignExamToCourse: async (examId: string, payload: AssignExamToCoursePayload) => {
        return backendRequest<AssignExamToCourseResponse>(`${EXAMS_ENDPOINT}/${examId}/assign-to-course`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    getResponseByIndex: async (examId: string, questionIndex: number) => {
        const url = `${EXAMS_ENDPOINT}/${examId}/responses/${questionIndex}`;
        let response: Response;

        try {
            response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "No fue posible contactar al backend";
            showErrorToast(message);
            throw err;
        }

        if (response.status === 404) {
            // Si no existe respuesta todavía, no es un error: simplemente no mostrarla como respondida.
            return null;
        }

        const payload = await parseResponseJson(response);

        if (!response.ok) {
            const message = extractBackendMessage(payload) ?? response.statusText ?? `Error ${response.status}`;
            showErrorToast(message);
            throw new Error(message);
        }

        return payload?.data ?? null;
    },
};

const parseResponseJson = async (response: Response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};
