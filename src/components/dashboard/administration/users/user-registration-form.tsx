'use client';

import { useState } from "react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Checkbox } from "../../../ui/checkbox";
import { Plus, AlertCircle } from "lucide-react";
import { showSuccessToast } from "@/utils/toast";
import { CreateAdminPayload } from "@/types/users/admin";
import { CreateStudentPayload } from "@/types/users/student";
import { CreateTeacherPayload } from "@/types/users/teacher";
import { UserRole } from "@/types/users/users";

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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
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
    teachingSubjects: [] as string[],
  });

  const updateForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSubject = (subjectId: string) => {
    setForm((prev) => {
      const exists = prev.subjects.includes(subjectId);
      const nextSubjects = exists
        ? prev.subjects.filter((id) => id !== subjectId)
        : [...prev.subjects, subjectId];

      // Un profesor líder siempre imparte la asignatura que lidera
      const alreadyTeaching = prev.teachingSubjects.includes(subjectId);
      const nextTeaching = exists
        ? prev.teachingSubjects.filter((id) => id !== subjectId)
        : alreadyTeaching
          ? prev.teachingSubjects
          : [...prev.teachingSubjects, subjectId];

      return {
        ...prev,
        subjects: nextSubjects,
        teachingSubjects: nextTeaching,
      };
    });
  };

  const toggleTeachingSubject = (subjectId: string) => {
    setForm((prev) => {
      const exists = prev.teachingSubjects.includes(subjectId);
      const isLeaderOfSubject = prev.subjects.includes(subjectId);
      // Si es jefe de la asignatura, no se permite quitarla de las que imparte
      if (exists && isLeaderOfSubject) {
        return prev;
      }
      return {
        ...prev,
        teachingSubjects: exists
          ? prev.teachingSubjects.filter((id) => id !== subjectId)
          : [...prev.teachingSubjects, subjectId],
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
      teachingSubjects: [],
    });
    setUserType("admin");
    setValidationErrors([]);
  };

  const getValidationErrors = () => {
    const errors: string[] = [];

    if (!form.name.trim()) {
      errors.push("Ingresa el nombre completo.");
    }

    if (!form.email.trim()) {
      errors.push("Ingresa el correo electrónico.");
    }

    if (!form.password) {
      errors.push("Ingresa la contraseña.");
    } else if (form.password.length < 8) {
      errors.push("La contraseña debe tener al menos 8 caracteres.");
    }

    if (userType === "student") {
      if (!form.age) {
        errors.push("Indica la edad del estudiante.");
      } else if (Number.isNaN(Number(form.age))) {
        errors.push("La edad debe ser un número válido.");
      }

      if (!form.course.trim()) {
        errors.push("Indica el curso del estudiante.");
      }
    }

    if (userType === "teacher") {
      if (!form.specialty.trim()) {
        errors.push("Agrega la especialidad del profesor.");
      }

      if (subjects.length === 0) {
        errors.push("Para registrar un profesor primero crea asignaturas en la configuración de preguntas.");
      }

      if (form.teachingSubjects.length === 0) {
        errors.push("Selecciona al menos una asignatura que imparte el profesor.");
      }

      if (form.hasRoleSubjectLeader) {
        if (form.subjects.length === 0) {
          errors.push("Selecciona al menos una asignatura para el rol de Jefe de Asignatura.");
        }

        const missingTeaching = form.subjects.some((id) => !form.teachingSubjects.includes(id));
        if (missingTeaching) {
          errors.push("Las asignaturas donde es jefe también deben estar marcadas como impartidas.");
        }
      }
    }

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = getValidationErrors();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setIsSubmitting(true);
    try {
      let successMessage = "Usuario creado correctamente";

      if (userType === "admin") {
        const payload: CreateAdminPayload = {
          name: form.name,
          email: form.email,
          password: form.password,
        };
        await onCreateAdmin(payload);
        successMessage = "Administrador creado correctamente";
      } else if (userType === "student") {
        const payload: CreateStudentPayload = {
          name: form.name,
          email: form.email,
          password: form.password,
          age: Number(form.age),
          course: form.course.trim(),
        };
        await onCreateStudent(payload);
        successMessage = "Estudiante creado correctamente";
      } else {
        const payload: CreateTeacherPayload = {
          name: form.name,
          email: form.email,
          password: form.password,
          specialty: form.specialty,
          hasRoleExaminer: form.hasRoleExaminer,
          hasRoleSubjectLeader: form.hasRoleSubjectLeader,
          subjects_ids: form.hasRoleSubjectLeader ? form.subjects : [],
          teaching_subjects_ids: form.teachingSubjects,
        };
        await onCreateTeacher(payload);
        successMessage = "Profesor creado correctamente";
      }

      showSuccessToast(successMessage);
      resetForm();
    } catch (err) {
      console.error(err);
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
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="userType">Tipo de Usuario</Label>
          <Select
            value={userType}
            onValueChange={(value) => {
              setUserType(value as UserRole);
              setValidationErrors([]);
            }}
          >
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Curso</Label>
              <Input
                id="course"
                type="text"
                value={form.course}
                onChange={(e) => updateForm("course", e.target.value)}
                placeholder="Ej: 3A"
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
              />
            </div>

            <div className="space-y-2">
              <Label>
                Asignaturas que imparte
                {form.teachingSubjects.length > 0 &&
                  ` (${form.teachingSubjects.length} seleccionada${form.teachingSubjects.length > 1 ? "s" : ""})`}
              </Label>
              <p className="text-xs text-muted-foreground">
                Si es jefe de una asignatura, automáticamente debe impartirla y no podrá desmarcarla.
              </p>
              {subjects.length > 0 ? (
                <>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`teaching-subject-${subject.id}`}
                          checked={form.teachingSubjects.includes(subject.id)}
                          onCheckedChange={() => toggleTeachingSubject(subject.id)}
                        />
                        <label htmlFor={`teaching-subject-${subject.id}`} className="text-sm flex-1 cursor-pointer">
                          {subject.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  {form.teachingSubjects.length === 0 && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800">
                        Debe seleccionar al menos una asignatura que imparte el profesor.
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
          />
        </div>

        {validationErrors.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-900">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Faltan datos para crear el {ROLE_LABELS[userType]}:</p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                {validationErrors.map((error, index) => (
                  <li key={`${error}-${index}`}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <Plus className="h-4 w-4 mr-2" />
          Crear {ROLE_LABELS[userType]}
        </Button>
      </form>
    </Card>
  );
}
