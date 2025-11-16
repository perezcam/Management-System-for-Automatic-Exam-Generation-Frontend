import type {
  CreateSubjectPayload,
  SubjectDetail,
  UpdateSubjectPayload,
} from "@/types/question_administration";
import type { BaseResponse, RetrieveManySchema, RetrieveOneSchema } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import { QUESTION_SUBJECTS_ENDPOINT } from "@/services/api/endpoints";

export const normalizeSubject = (subject: SubjectDetail): SubjectDetail => {
  const topics = subject.topics ?? [];
  return {
    ...subject,
    topics_amount: topics.length,
    topics: topics.map((topic) => {
      const subtopics = topic.subtopics ?? [];
      return {
        ...topic,
        subtopics,
        subtopics_amount: subtopics.length,
      };
    }),
  };
};

export const normalizeSubjects = (subjects: SubjectDetail[]) => subjects.map(normalizeSubject);

export const fetchSubjects = async (): Promise<SubjectDetail[]> => {
  const resp = await backendRequest<RetrieveManySchema<SubjectDetail>>(QUESTION_SUBJECTS_ENDPOINT);
  const subjects = resp.data;
  return normalizeSubjects(subjects);
};

export const createSubject = async (payload: CreateSubjectPayload): Promise<SubjectDetail> => {
  const resp = await backendRequest<RetrieveOneSchema<SubjectDetail>>(QUESTION_SUBJECTS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const created = resp.data;
  if (!created) {
    throw new Error("El backend no devolvió la materia creada");
  }
  return normalizeSubject(created);
};

export const updateSubject = async (
  subjectId: string,
  payload: UpdateSubjectPayload,
): Promise<SubjectDetail> => {
  const resp = await backendRequest<RetrieveOneSchema<SubjectDetail>>(`${QUESTION_SUBJECTS_ENDPOINT}/${subjectId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const updated = resp.data;
  if (!updated) {
    throw new Error("El backend no devolvió la materia actualizada");
  }
  return normalizeSubject(updated);
};

export const deleteSubject = async (subjectId: string): Promise<void> => {
  await backendRequest<BaseResponse>(`${QUESTION_SUBJECTS_ENDPOINT}/${subjectId}`, { method: "DELETE" });
};
