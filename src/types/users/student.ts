

export type StudentDetail = {
  userId: string;
  id: string;
  name: string;
  email: string;
  age: number;
  course: string;
};

export type StudentUser = StudentDetail & { role: "student" };

// Create schemas

export type CreateStudentPayload = {
  name: string;
  email: string;
  password: string;
  age: number;
  course: string;
};



// Update schemas
export type UpdateStudentPayload = Partial<Omit<CreateStudentPayload, "password">>;
