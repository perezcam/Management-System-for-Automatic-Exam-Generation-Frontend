'use client';

import { useState } from "react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Checkbox } from "../../../ui/checkbox";
import { Plus, AlertCircle } from "lucide-react";
import type {
  CreateAdminPayload,
  CreateStudentPayload,
  CreateTeacherPayload,
  UserRole,
} from "@/types/users";

interface UserRegistrationFormProps {
  subjects?: { id: string; name: string }[];
  onCreateAdmin: (payload: CreateAdminPayload) => Promise<void> | void;
  onCreateStudent: (payload: CreateStudentPayload) => Promise<void> | void;
  onCreateTeacher: (payload: CreateTeacherPayload) => Promise<void> | void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  student: "Estudiante",
  teacher: "Profesor",
};

export function UserRegistrationForm({
  subjects = [],
  onCreateAdmin,
  onCreateStudent,
  onCreateTeacher,
}: UserRegistrationFormProps) {
  const [userType, setUserType] = useState<UserRole>("admin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    course: "",
    specialty: "",
    hasRoleExaminer: false,
    hasRoleSubjectLeader: false,
    subjects: [] as string[],
  });

  const updateForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSubject = (subjectId: string) => {
    setForm((prev) => {
      const exists = prev.subjects.includes(subjectId);
      return {
        ...prev,
        subjects: exists ? prev.subjects.filter((id) => id !== subjectId) : [...prev.subjects, subjectId],
      };
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      age: "",
      course: "",
      specialty: "",
      hasRoleExaminer: false,
      hasRoleSubjectLeader: false,
      subjects: [],
    });
    setUserType("admin");
  };

  const isFormValid = () => {
    if (!form.name || !form.email || !form.password) {
      return false;
    }
    if (userType === "student" && (!form.age || !form.course)) {
      return false;
    }
    if (userType === "student") {
      const age = Number(form.age);
      const course = Number(form.course);
      if (Number.isNaN(age) || Number.isNaN(course)) return false;
    }
    if (userType === "teacher") {
      if (!form.specialty) return false;
      if (form.hasRoleSubjectLeader && form.subjects.length === 0) return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid()) return;

    try {
      setIsSubmitting(true);

      if (userType === "admin") {
        const payload: CreateAdminPayload = {
          name: form.name,
          email: form.email,
          password: form.password,
        };
        await onCreateAdmin(payload);
      } else if (userType === "student") {
        const payload: CreateStudentPayload = {
          name: form.name,
          email: form.email,
          password: form.password,
          age: Number(form.age),
          course: Number(form.course),
        };
        await onCreateStudent(payload);
      } else {
        const payload: CreateTeacherPayload = {
          name: form.name,
          email: form.email,
          password: form.password,
          specialty: form.specialty,
          hasRoleExaminer: form.hasRoleExaminer,
          hasRoleSubjectLeader: form.hasRoleSubjectLeader,
          subjects_ids: form.hasRoleSubjectLeader ? form.subjects : undefined,
        };
        await onCreateTeacher(payload);
      }

      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="h-5 w-5" />
        <h2 className="text-lg">Registrar Nuevo Usuario</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userType">Tipo de Usuario</Label>
          <Select value={userType} onValueChange={(value) => setUserType(value as UserRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="student">Estudiante</SelectItem>
              <SelectItem value="teacher">Profesor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre Completo</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            placeholder="Ingrese nombre completo"
            required
          />
        </div>

        {userType === "student" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                type="number"
                value={form.age}
                onChange={(e) => updateForm("age", e.target.value)}
                placeholder="Ingrese edad"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Curso (número)</Label>
              <Input
                id="course"
                type="number"
                value={form.course}
                onChange={(e) => updateForm("course", e.target.value)}
                placeholder="Ej: 3"
                required
              />
            </div>
          </>
        )}

        {userType === "teacher" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                value={form.specialty}
                onChange={(e) => updateForm("specialty", e.target.value)}
                placeholder="Ingrese especialidad"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Roles disponibles</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="role-examiner"
                    checked={form.hasRoleExaminer}
                    onCheckedChange={(checked) => updateForm("hasRoleExaminer", Boolean(checked))}
                  />
                  <label htmlFor="role-examiner" className="text-sm">
                    Examinador
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="role-leader"
                    checked={form.hasRoleSubjectLeader}
                    onCheckedChange={(checked) => {
                      updateForm("hasRoleSubjectLeader", Boolean(checked));
                      if (!checked) {
                        updateForm("subjects", []);
                      }
                    }}
                  />
                  <label htmlFor="role-leader" className="text-sm">
                    Jefe de Asignatura
                  </label>
                </div>
              </div>
            </div>

            {form.hasRoleSubjectLeader && (
              <div className="space-y-2">
                <Label>
                  Asignaturas
                  {form.subjects.length > 0 && ` (${form.subjects.length} seleccionada${form.subjects.length > 1 ? "s" : ""})`}
                </Label>
                {subjects.length > 0 ? (
                  <>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {subjects.map((subject) => (
                        <div key={subject.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`subject-${subject.id}`}
                            checked={form.subjects.includes(subject.id)}
                            onCheckedChange={() => toggleSubject(subject.id)}
                          />
                          <label htmlFor={`subject-${subject.id}`} className="text-sm flex-1 cursor-pointer">
                            {subject.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {form.subjects.length === 0 && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-800">
                          Debe seleccionar al menos una asignatura para los profesores con rol de Jefe de Asignatura.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground p-3 border rounded-md">
                    No hay asignaturas disponibles. Crea asignaturas en la sección de Configuración de Preguntas.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => updateForm("email", e.target.value)}
            placeholder="usuario@universidad.edu"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => updateForm("password", e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={!isFormValid() || isSubmitting}>
          <Plus className="h-4 w-4 mr-2" />
          Crear {ROLE_LABELS[userType]}
        </Button>
      </form>
    </Card>
  );
}
