import type {
  CreateSubjectPayload,
  SubjectDetail,
  UpdateSubjectPayload,
} from "@/types/question-bank/subject";
import {
  QUESTION_SUBJECTS_ENDPOINT,
  USE_MOCK_QUESTION_ADMIN,
  normalizeSubject,
  normalizeSubjects,
  readMockSubjects,
  replaceMockSubjects,
  request,
  updateMockSubjects,
  createRandomId,
} from "./base";

export const fetchSubjects = async (): Promise<SubjectDetail[]> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    return normalizeSubjects(readMockSubjects());
  }
  const subjects = await request<SubjectDetail[]>(QUESTION_SUBJECTS_ENDPOINT);
  return normalizeSubjects(subjects);
};

export const createSubject = async (payload: CreateSubjectPayload): Promise<SubjectDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    const newSubject: SubjectDetail = normalizeSubject({
      subject_id: createRandomId(),
      subject_name: payload.subject_name,
      subject_program: payload.subject_program,
      subject_leader_name: "",
      topics_amount: 0,
      topics: [],
    });
    updateMockSubjects((subjects) => [...subjects, newSubject]);
    return newSubject;
  }
  const created = await request<SubjectDetail>(QUESTION_SUBJECTS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeSubject(created);
};

export const updateSubject = async (
  subjectId: string,
  payload: UpdateSubjectPayload,
): Promise<SubjectDetail> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    let updatedSubject: SubjectDetail | null = null;
    updateMockSubjects((subjects) =>
      subjects.map((subject) => {
        if (subject.subject_id === subjectId) {
          updatedSubject = normalizeSubject({
            ...subject,
            subject_name: payload.subject_name ?? subject.subject_name,
            subject_program: payload.subject_program ?? subject.subject_program,
          });
          return updatedSubject;
        }
        return subject;
      }),
    );
    if (!updatedSubject) throw new Error("Materia no encontrada");
    return updatedSubject;
  }
  const updated = await request<SubjectDetail>(`${QUESTION_SUBJECTS_ENDPOINT}/${subjectId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeSubject(updated);
};

export const deleteSubject = async (subjectId: string): Promise<void> => {
  if (USE_MOCK_QUESTION_ADMIN) {
    replaceMockSubjects(readMockSubjects().filter((subject) => subject.subject_id !== subjectId));
    return;
  }
  await request<void>(`${QUESTION_SUBJECTS_ENDPOINT}/${subjectId}`, { method: "DELETE" });
};
