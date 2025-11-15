import type {
  TeacherDetail,
  TeacherUser,
  CreateTeacherPayload,
  UpdateTeacherPayload,
  PaginatedResult,
  PaginationParams
} from "@/types/users";
import {
  TEACHER_ENDPOINT,
  USE_MOCK_USERS,
  DEFAULT_PAGE_SIZE,
  randomId,
  request,
  unwrap,
} from "./common";

// Mock específico de teachers
let mockTeachers: TeacherUser[] = [
  {
    id: "teacher-1",
    userId: "user-teacher-1",
    name: "Patricia Profesora",
    email: "patricia.teacher@example.com",
    specialty: "Matemáticas",
    hasRoleExaminer: true,
    hasRoleSubjectLeader: true,
    subjects_ids: ["MAT101"],
    subjects_names: ["Matemáticas I"],
    role: "teacher",
  },
];

const toTeacherUser = (teacher: TeacherDetail): TeacherUser => ({
  ...teacher,
  role: "teacher",
});

// ---- Fetchers paginados ----

export const fetchTeachers = async (
  params?: PaginationParams
): Promise<PaginatedResult<TeacherUser>> => {
  const { limit = DEFAULT_PAGE_SIZE, offset = 0 } = params ?? {};

  if (USE_MOCK_USERS) {
    const total = mockTeachers.length;
    const data = mockTeachers.slice(offset, offset + limit);
    return { data, meta: { limit, offset, total } };
  }

  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const resp = await request<PaginatedResult<TeacherDetail>>(
    `${TEACHER_ENDPOINT}?${searchParams.toString()}`
  );

  return {
    data: resp.data.map(toTeacherUser),
    meta: resp.meta,
  };
};


// -------- Creators --------

export const createTeacher = async (
  payload: CreateTeacherPayload
): Promise<TeacherUser> => {
  if (USE_MOCK_USERS) {
    const newTeacher: TeacherUser = {
      id: randomId(),
      userId: randomId(),
      name: payload.name,
      email: payload.email,
      specialty: payload.specialty,
      hasRoleExaminer: payload.hasRoleExaminer,
      hasRoleSubjectLeader: payload.hasRoleSubjectLeader,
      subjects_ids: payload.subjects_ids,
      subjects_names: payload.subjects_ids,
      role: "teacher",
    };
    mockTeachers = [...mockTeachers, newTeacher];
    return newTeacher;
  }

  const createdResp = await request<TeacherDetail | { data: TeacherDetail }>(
    TEACHER_ENDPOINT,
    {
      method: "POST",
      body: JSON.stringify({ ...payload, role: "teacher" }),
    }
  );
  const created = unwrap<TeacherDetail>(createdResp);
  return toTeacherUser(created);
};

// -------- Updaters --------

export const updateTeacher = async (
  teacherId: string,
  payload: UpdateTeacherPayload
): Promise<TeacherUser> => {
  if (USE_MOCK_USERS) {
    mockTeachers = mockTeachers.map((teacher) =>
      teacher.id === teacherId ? { ...teacher, ...payload } : teacher
    );
    const updated = mockTeachers.find((teacher) => teacher.id === teacherId);
    if (!updated) throw new Error("Profesor no encontrado");
    return updated;
  }

  const updatedResp = await request<TeacherDetail | { data: TeacherDetail }>(
    `${TEACHER_ENDPOINT}/${teacherId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
  const updated = unwrap<TeacherDetail>(updatedResp);
  return toTeacherUser(updated);
};

// -------- Deleters --------

export const deleteTeacher = async (teacherId: string): Promise<void> => {
  if (USE_MOCK_USERS) {
    mockTeachers = mockTeachers.filter((teacher) => teacher.id !== teacherId);
    return;
  }

  await request<void>(`${TEACHER_ENDPOINT}/${teacherId}`, {
    method: "DELETE",
  });
};
