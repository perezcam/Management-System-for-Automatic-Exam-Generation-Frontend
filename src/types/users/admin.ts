export type AdminDetail = {
  id: string;
  name: string;
  email: string;
};

export type AdminUser = AdminDetail & { role: "admin" };

// Create schemas
export type CreateAdminPayload = {
  name: string;
  email: string;
  password: string;
};

// Update schemas
export type UpdateAdminPayload = Partial<Omit<CreateAdminPayload, "password">>;
