

export type StudentDetail = {
  userId: string;
  id: string;
  name: string;
  email: string;
  age: number;
  course: number;
};

export type StudentUser = StudentDetail & { role: "student" };

// Create schemas

export type CreateStudentPayload = {
  name: string;
  email: string;
  password: string;
  age: number;
  course: number;
};



// Update schemas
export type UpdateStudentPayload = Partial<Omit<CreateStudentPayload, "password">>;
