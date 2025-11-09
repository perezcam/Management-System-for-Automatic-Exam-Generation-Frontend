
export type AdminDetail = {
  id: string;
  name: string;
  email: string;
};


export type AdminUser = AdminDetail & { role: "admin" };


export type CreateAdminPayload = {
  name: string;
  email: string;
  password: string;
};

export type UpdateAdminPayload = Partial<Omit<CreateAdminPayload, "password">>;
