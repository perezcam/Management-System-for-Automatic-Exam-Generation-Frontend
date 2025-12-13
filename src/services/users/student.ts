import type {
  CreateStudentPayload,
  StudentDetail,
  StudentUser,
  UpdateStudentPayload,
} from "@/types/users/users";
import type {
  BaseResponse,
  PaginatedSchema,
  RetrieveOneSchema,
} from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import {
  PaginatedResult,
  PaginationParams,
  STUDENT_ENDPOINT,
  withQueryParams,
} from "@/services/api/endpoints";

export const toStudentUser = (student: StudentDetail): StudentUser => ({
  ...student,
  role: "student",
});


export const fetchStudents = async (
  params: PaginationParams & { filter?: string; course?: string } = {},
): Promise<PaginatedResult<StudentUser>> => {
  const url = withQueryParams(STUDENT_ENDPOINT, {
    limit: params.limit,
    offset: params.offset,
    filter: params.filter,
    course: params.course,
  });
  const resp = await backendRequest<PaginatedSchema<StudentDetail>>(url);
  return { data: resp.data.map(toStudentUser), meta: resp.meta };
};

export const fetchStudentDetail = async (studentId: string): Promise<StudentUser> => {
  const resp = await backendRequest<RetrieveOneSchema<StudentDetail>>(`${STUDENT_ENDPOINT}/${studentId}`);
  const data = resp.data;
  if (!data) {
    throw new Error("El backend no devolvió el estudiante solicitado");
  }
  return toStudentUser(data);
};

export const createStudent = async (payload: CreateStudentPayload): Promise<StudentUser> => {
  const createdResp = await backendRequest<RetrieveOneSchema<StudentDetail>>(STUDENT_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const created = createdResp.data;
  if (!created) {
    throw new Error("El backend no devolvió el estudiante creado");
  }
  return toStudentUser(created);
};

export const updateStudent = async (studentId: string, payload: UpdateStudentPayload): Promise<StudentUser> => {
  const updatedResp = await backendRequest<RetrieveOneSchema<StudentDetail>>(`${STUDENT_ENDPOINT}/${studentId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const updated = updatedResp.data;
  if (!updated) {
    throw new Error("El backend no devolvió el estudiante actualizado");
  }
  return toStudentUser(updated);
};

export const deleteStudent = async (studentId: string): Promise<void> => {
  await backendRequest<BaseResponse>(`${STUDENT_ENDPOINT}/${studentId}`, { method: "DELETE" });
};
