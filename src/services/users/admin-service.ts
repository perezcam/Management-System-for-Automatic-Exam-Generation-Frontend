import type {
  AdminDetail,
  AdminUser,
  CreateAdminPayload,
  UpdateAdminPayload,
} from "@/types/users";
import {
  ADMIN_ENDPOINT,
  USE_MOCK_USERS,
  randomId,
  request,
  unwrap,
} from "./common";

// mock sólo para admins
let mockAdmins: AdminUser[] = [
  {
    id: "admin-1",
    name: "Ana Administradora",
    email: "ana.admin@example.com",
    role: "admin",
  },
];

const toAdminUser = (admin: AdminDetail): AdminUser => ({
  ...admin,
  role: "admin",
});

// -------- Fetchers --------

export const fetchAdmins = async (): Promise<AdminUser[]> => {
  if (USE_MOCK_USERS) {
    return mockAdmins;
  }

  const resp = await request<{ data: AdminDetail[] }>(
    `${ADMIN_ENDPOINT}?role=admin`
  );
  const list = resp.data;
  return list.map(toAdminUser);
};

// -------- Creators --------

export const createAdmin = async (
  payload: CreateAdminPayload
): Promise<AdminUser> => {
  if (USE_MOCK_USERS) {
    const newAdmin: AdminUser = {
      id: randomId(),
      name: payload.name,
      email: payload.email,
      role: "admin",
    };
    mockAdmins = [...mockAdmins, newAdmin];
    return newAdmin;
  }

  const createdResp = await request<AdminDetail | { data: AdminDetail }>(
    ADMIN_ENDPOINT,
    {
      method: "POST",
      body: JSON.stringify({ ...payload, role: "admin" }),
    }
  );
  const created = unwrap<AdminDetail>(createdResp);
  return toAdminUser(created);
};

// -------- Updaters --------

export const updateAdmin = async (
  adminId: string,
  payload: UpdateAdminPayload
): Promise<AdminUser> => {
  if (USE_MOCK_USERS) {
    mockAdmins = mockAdmins.map((admin) =>
      admin.id === adminId ? { ...admin, ...payload } : admin
    );
    const updated = mockAdmins.find((admin) => admin.id === adminId);
    if (!updated) throw new Error("Administrador no encontrado");
    return updated;
  }

  const updatedResp = await request<AdminDetail | { data: AdminDetail }>(
    `${ADMIN_ENDPOINT}/${adminId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
  const updated = unwrap<AdminDetail>(updatedResp);
  return toAdminUser(updated);
};

// -------- Deleters --------

export const deleteAdmin = async (adminId: string): Promise<void> => {
  if (USE_MOCK_USERS) {
    mockAdmins = mockAdmins.filter((admin) => admin.id !== adminId);
    return;
  }

  await request<void>(`${ADMIN_ENDPOINT}/${adminId}`, { method: "DELETE" });
};
