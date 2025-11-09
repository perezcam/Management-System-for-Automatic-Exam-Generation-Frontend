import { get_admin_url } from "@/config/backend";
import type { AdminDetail, AdminUser, CreateAdminPayload, UpdateAdminPayload } from "@/types/user/admin";

const ADMIN_ENDPOINT = get_admin_url();
const USE_MOCK_USERS = process.env.NEXT_PUBLIC_USE_MOCK_USERS === "true";

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    return data?.message ?? `Error ${response.status}`;
  } catch {
    return response.statusText || "Error de red";
  }
};

const randomId = () => Math.random().toString(36).slice(2);

let mockAdmins: AdminUser[] = [
  { id: "admin-1", name: "Ana Administradora", email: "ana.admin@example.com", role: "admin" },
];

export const fetchAdmins = async (): Promise<AdminUser[]> => {
  if (USE_MOCK_USERS) {
    return mockAdmins;
  }
  const data = await request<AdminDetail[]>(ADMIN_ENDPOINT);
  return data.map((admin) => ({ ...admin, role: "admin" }));
};

export const createAdmin = async (payload: CreateAdminPayload): Promise<AdminUser> => {
  if (USE_MOCK_USERS) {
    const newAdmin: AdminUser = { id: randomId(), name: payload.name, email: payload.email, role: "admin" };
    mockAdmins = [...mockAdmins, newAdmin];
    return newAdmin;
  }
  const created = await request<AdminDetail>(ADMIN_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { ...created, role: "admin" };
};

export const updateAdmin = async (adminId: string, payload: UpdateAdminPayload): Promise<AdminUser> => {
  if (USE_MOCK_USERS) {
    mockAdmins = mockAdmins.map((admin) => (admin.id === adminId ? { ...admin, ...payload } : admin));
    const updated = mockAdmins.find((admin) => admin.id === adminId);
    if (!updated) throw new Error("Administrador no encontrado");
    return updated;
  }
  const updated = await request<AdminDetail>(`${ADMIN_ENDPOINT}/${adminId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return { ...updated, role: "admin" };
};

export const deleteAdmin = async (adminId: string): Promise<void> => {
  if (USE_MOCK_USERS) {
    mockAdmins = mockAdmins.filter((admin) => admin.id !== adminId);
    return;
  }
  await request<void>(`${ADMIN_ENDPOINT}/${adminId}`, { method: "DELETE" });
};
