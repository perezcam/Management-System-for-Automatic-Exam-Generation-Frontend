import type {
  AdminDetail,
  AdminUser,
  CreateAdminPayload,
  UpdateAdminPayload,
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
  USERS_ENDPOINT,
  withQueryParams,
} from "@/services/api/endpoints";

export const toAdminUser = (admin: AdminDetail): AdminUser => ({
  ...admin,
  role: "admin",
});

export const fetchAdmins = async (
  params: PaginationParams & { filter?: string } = {},
): Promise<PaginatedResult<AdminUser>> => {
  const url = withQueryParams(USERS_ENDPOINT, {
    limit: params.limit,
    offset: params.offset,
    role: "admin",
    filter: params.filter,
  });
  const resp = await backendRequest<PaginatedSchema<AdminDetail>>(url);
  return { data: resp.data.map(toAdminUser), meta: resp.meta };
};

export const fetchAdminDetail = async (adminId: string): Promise<AdminUser> => {
  const resp = await backendRequest<RetrieveOneSchema<AdminDetail>>(`${USERS_ENDPOINT}/${adminId}`);
  const data = resp.data;
  if (!data) {
    throw new Error("El backend no devolvió el administrador solicitado");
  }
  return toAdminUser(data);
};

export const createAdmin = async (payload: CreateAdminPayload): Promise<AdminUser> => {
  // El backend espera un campo role para asignar permisos
  const createdResp = await backendRequest<RetrieveOneSchema<AdminDetail>>(USERS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({ ...payload, role: "admin" }),
  });
  const created = createdResp.data;
  if (!created) {
    throw new Error("El backend no devolvió el administrador creado");
  }
  return toAdminUser(created);
};

export const updateAdmin = async (adminId: string, payload: UpdateAdminPayload): Promise<AdminUser> => {
  const updatedResp = await backendRequest<RetrieveOneSchema<AdminDetail>>(`${USERS_ENDPOINT}/${adminId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const updated = updatedResp.data;
  if (!updated) {
    throw new Error("El backend no devolvió el administrador actualizado");
  }
  return toAdminUser(updated);
};

export const deleteAdmin = async (adminId: string): Promise<void> => {
  await backendRequest<BaseResponse>(`${USERS_ENDPOINT}/${adminId}`, { method: "DELETE" });
};
