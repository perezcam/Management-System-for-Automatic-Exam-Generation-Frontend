import type {
  CreateSubjectPayload,
  SubjectDetail,
  UpdateSubjectPayload,
} from "@/types/question_administration";
import {
  QUESTION_SUBJECTS_ENDPOINT,
  USE_MOCK_QUESTION_ADMIN,
  mockSubjects,
  normalizeSubject,
  normalizeSubjects,
  randomId,
  request,
  unwrap,
} from "./common";
import  { DEFAULT_PAGE_SIZE, type PaginationParams, type PaginatedResult } from "@/types/question_administration";

export const fetchSubjectsPaginated = async (
  params: PaginationParams = {}
): Promise<PaginatedResult<SubjectDetail>> => {
  const { limit = DEFAULT_PAGE_SIZE, offset = 0 } = params;

  if (USE_MOCK_QUESTION_ADMIN) {
    const normalized = normalizeSubjects(mockSubjects);
    const total = normalized.length;
    const data = normalized.slice(offset, offset + limit);

    return {
      data,
      meta: { limit, offset, total },
    };
  }

  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const resp = await request<PaginatedResult<SubjectDetail>>(
    `${QUESTION_SUBJECTS_ENDPOINT}?${searchParams.toString()}`
  );

  return {
    data: normalizeSubjects(resp.data),
    meta: resp.meta,
  };
};

export const fetchSubjects = async (): Promise<SubjectDetail[]> => {
  const { data } = await fetchSubjectsPaginated();
  return data;
};

export const createSubject = async (
  payload: CreateSubjectPayload
): Promise<SubjectDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const newSubject: SubjectDetail = normalizeSubject({
      subject_id: randomId(),
      subject_name: payload.subject_name,
      subject_program: payload.subject_program,
      subject_leader_name: "",
      topics_amount: 0,
      topics: [],
    });

    mockSubjects.push(newSubject);
    return newSubject;
  }

  const resp = await request<unknown>(QUESTION_SUBJECTS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const created = unwrap<SubjectDetail>(resp);
  return normalizeSubject(created);
};

export const updateSubject = async (
  subjectId: string,
  payload: UpdateSubjectPayload
): Promise<SubjectDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const index = mockSubjects.findIndex((s) => s.subject_id === subjectId);
    if (index === -1) {
      throw new Error("Materia no encontrada");
    }

    const current = mockSubjects[index];

    const updatedSubject = normalizeSubject({
      ...current,
      subject_name: payload.subject_name ?? current.subject_name,
      subject_program: payload.subject_program ?? current.subject_program,
    });

    mockSubjects[index] = updatedSubject;
    return updatedSubject;
  }

  const resp = await request<unknown>(
    `${QUESTION_SUBJECTS_ENDPOINT}/${subjectId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
  const updated = unwrap<SubjectDetail>(resp);
  return normalizeSubject(updated);
};

export const deleteSubject = async (subjectId: string): Promise<void> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const index = mockSubjects.findIndex((s) => s.subject_id === subjectId);
    if (index !== -1) {
      mockSubjects.splice(index, 1);
    }
    return;
  }

  await request<void>(`${QUESTION_SUBJECTS_ENDPOINT}/${subjectId}`, {
    method: "DELETE",
  });
};
