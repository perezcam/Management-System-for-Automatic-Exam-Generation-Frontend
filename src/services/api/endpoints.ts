import type { PaginationMeta } from "@/types/backend-responses";

export const API_ENDPOINTS = {
  users: "/api/proxy/users",
  student: "/api/proxy/student",
  teacher: "/api/proxy/teacher",
  questionTypes: "/api/proxy/question-types",
  questionBankQuestions: "/api/proxy/questions",
  questionSubjects: "/api/proxy/subjects",
  questionTopics: "/api/proxy/topics",
  questionSubtopics: "/api/proxy/subtopics",
  subjectTopics: "/api/proxy/subject-topics",
} as const;

export type ApiEndpointKey = keyof typeof API_ENDPOINTS;
export const getEndpoint = (key: ApiEndpointKey): string => API_ENDPOINTS[key];

export const USERS_ENDPOINT = API_ENDPOINTS.users;
export const STUDENT_ENDPOINT = API_ENDPOINTS.student;
export const TEACHER_ENDPOINT = API_ENDPOINTS.teacher;
export const CURRENT_USER_ENDPOINT = `${USERS_ENDPOINT}/me`;
export const QUESTION_TYPES_ENDPOINT = API_ENDPOINTS.questionTypes;
export const QUESTION_BANK_QUESTIONS_ENDPOINT = API_ENDPOINTS.questionBankQuestions;
export const QUESTION_SUBJECTS_ENDPOINT = API_ENDPOINTS.questionSubjects;
export const QUESTION_TOPICS_ENDPOINT = API_ENDPOINTS.questionTopics;
export const QUESTION_SUBTOPICS_ENDPOINT = API_ENDPOINTS.questionSubtopics;
export const QUESTION_SUBJECT_TOPICS_ENDPOINT = API_ENDPOINTS.subjectTopics;


export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export const buildQueryString = (params: QueryParams = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const withQueryParams = (endpoint: string, params: QueryParams = {}) =>
  `${endpoint}${buildQueryString(params)}`;

export type PaginationParams = {
  limit?: number;
  offset?: number;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: PaginationMeta;
};
