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

export const fetchSubjects = async (): Promise<SubjectDetail[]> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    return normalizeSubjects(mockSubjects);
  }

  const resp = await request<unknown>(QUESTION_SUBJECTS_ENDPOINT);
  const subjects = unwrap<SubjectDetail[]>(resp);
  return normalizeSubjects(subjects);
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
