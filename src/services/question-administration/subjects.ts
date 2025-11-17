
import type { BaseResponse, PaginatedSchema, RetrieveManySchema, RetrieveOneSchema } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import { QUESTION_SUBJECTS_ENDPOINT, QUESTION_SUBJECT_TOPICS_ENDPOINT, withQueryParams } from "@/services/api/endpoints";
import { CreateSubjectPayload, SubjectDetail, UpdateSubjectPayload } from "@/types/question-administration/subject";

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

export type PaginatedSubjectsResult = {
  data: SubjectDetail[];
  meta: PaginatedSchema<SubjectDetail>["meta"] | null;
};

export const fetchSubjects = async (
  params?: { limit?: number; offset?: number },
): Promise<PaginatedSubjectsResult> => {
  if (!params) {
    const resp = await backendRequest<RetrieveManySchema<SubjectDetail>>(QUESTION_SUBJECTS_ENDPOINT);
    const subjects = resp.data;
    return { data: normalizeSubjects(subjects), meta: null };
  }

  const url = withQueryParams(QUESTION_SUBJECTS_ENDPOINT, {
    limit: params.limit,
    offset: params.offset,
  });
  const resp = await backendRequest<PaginatedSchema<SubjectDetail>>(url);
  const subjects = normalizeSubjects(resp.data);
  return { data: subjects, meta: resp.meta };
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

export const addTopicToSubject = async (
  subjectId: string,
  topicId: string,
): Promise<void> => {
  await backendRequest<BaseResponse>(QUESTION_SUBJECT_TOPICS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      subject_id: subjectId,
      topic_id: topicId,
    }),
  });
};

export const removeTopicFromSubject = async (
  subjectId: string,
  topicId: string,
): Promise<void> => {
  await backendRequest<BaseResponse>(QUESTION_SUBJECT_TOPICS_ENDPOINT, {
    method: "DELETE",
    body: JSON.stringify({
      subject_id: subjectId,
      topic_id: topicId,
    }),
  });
};
