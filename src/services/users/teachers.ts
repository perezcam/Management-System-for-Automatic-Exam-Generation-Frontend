
import type {
  BaseResponse,
  PaginatedSchema,
  RetrieveOneSchema,
} from "@/types/backend-responses";
import { backendRequest, backendRequestRaw } from "@/services/api-client";
import {
  PaginatedResult,
  PaginationParams,
  TEACHER_ENDPOINT,
  TEACHERS_BY_SUBJECT_ENDPOINT,
  withQueryParams,
} from "@/services/api/endpoints";
import { CreateTeacherPayload, TeacherDetail, TeacherUser, UpdateTeacherPayload } from "@/types/users/teacher";

export const toTeacherUser = (teacher: TeacherDetail): TeacherUser => ({
  ...teacher,
  role: "teacher",
});


export const fetchTeachers = async (
  params: PaginationParams & { filter?: string } = {},
): Promise<PaginatedResult<TeacherUser>> => {
  const url = withQueryParams(TEACHER_ENDPOINT, {
    limit: params.limit,
    offset: params.offset,
    filter: params.filter,
  });
  const resp = await backendRequest<PaginatedSchema<TeacherDetail>>(url);
  return { data: resp.data.map(toTeacherUser), meta: resp.meta };
};

export const fetchTeacherDetail = async (teacherId: string): Promise<TeacherUser> => {
  const resp = await backendRequest<RetrieveOneSchema<TeacherDetail>>(`${TEACHER_ENDPOINT}/${teacherId}`);
  const data = resp.data;
  if (!data) {
    throw new Error("El backend no devolvió el profesor solicitado");
  }
  return toTeacherUser(data);
};

export const createTeacher = async (payload: CreateTeacherPayload): Promise<TeacherUser> => {
  // El backend puede requerir rol "teacher" en la creación
  const createdResp = await backendRequest<RetrieveOneSchema<TeacherDetail>>(TEACHER_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      subjects_ids: payload.subjects_ids ?? [],
      teaching_subjects_ids: payload.teaching_subjects_ids ?? [],
      role: "teacher",
    }),
  });
  const created = createdResp.data;
  if (!created) {
    throw new Error("El backend no devolvió el profesor creado");
  }
  return toTeacherUser(created);
};

export const updateTeacher = async (teacherId: string, payload: UpdateTeacherPayload): Promise<TeacherUser> => {
  const updatedResp = await backendRequest<RetrieveOneSchema<TeacherDetail>>(`${TEACHER_ENDPOINT}/${teacherId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const updated = updatedResp.data;
  if (!updated) {
    throw new Error("El backend no devolvió el profesor actualizado");
  }
  return toTeacherUser(updated);
};

export const deleteTeacher = async (teacherId: string): Promise<void> => {
  await backendRequest<BaseResponse>(`${TEACHER_ENDPOINT}/${teacherId}`, { method: "DELETE" });
};

export const getTeachersBySubject = async (subjectId: string): Promise<TeacherUser[]> => {
  const resp = await backendRequestRaw<TeacherDetail[]>(`${TEACHERS_BY_SUBJECT_ENDPOINT}/${subjectId}`);
  return resp.map(toTeacherUser);
};
