import type { UserSummary, UserRole } from "@/types/users/users";
import type { PaginatedSchema, RetrieveOneSchema } from "@/types/backend-responses";
import { backendRequest } from "@/services/api-client";
import {
  PaginatedResult,
  PaginationParams,
  USERS_ENDPOINT,
  withQueryParams,
} from "@/services/api/endpoints";

export { fetchAdmins, fetchAdminDetail, createAdmin, updateAdmin, deleteAdmin } from "@/services/users/admins";
export {
  fetchStudents,
  fetchStudentDetail,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/services/users/student";
export {
  fetchTeachers,
  fetchTeacherDetail,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "@/services/users/teachers";

export const fetchUsers = async (
  params: PaginationParams & { role?: UserRole; filter?: string } = {},
): Promise<PaginatedResult<UserSummary>> => {
  const url = withQueryParams(USERS_ENDPOINT, {
    limit: params.limit,
    offset: params.offset,
    role: params.role,
    filter: params.filter,
  });
  const resp = await backendRequest<PaginatedSchema<UserSummary>>(url);
  return { data: resp.data, meta: resp.meta };
};

export const fetchUserSummary = async (userId: string): Promise<UserSummary> => {
  const resp = await backendRequest<RetrieveOneSchema<UserSummary>>(`${USERS_ENDPOINT}/${userId}`);
  if (!resp.data) {
    throw new Error("El backend no devolvió el usuario solicitado");
  }
  return resp.data;
};
