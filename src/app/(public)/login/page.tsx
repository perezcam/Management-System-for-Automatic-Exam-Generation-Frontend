import { LoginForm } from "@/components/LoginForm";
import { FileCheck2 } from "lucide-react";
import '@/app/globals.css'

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl">
              <FileCheck2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl text-gray-900">
                ExamPro
              </h1>
              <p className="text-gray-600">
                Sistema de Exámenes Automatizado
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl text-gray-900">
              Simplifica la gestión de tus exámenes
            </h2>
            <p className="text-gray-600 text-lg">
              Plataforma integral para que profesores creen,
              administren y califiquen exámenes de manera
              automática, mientras los estudiantes pueden
              realizarlos de forma fácil y segura.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg mt-1">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-900">
                  Creación rápida de exámenes
                </h3>
                <p className="text-gray-600 text-sm">
                  Diseña exámenes personalizados en minutos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg mt-1">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-900">
                  Calificación automática
                </h3>
                <p className="text-gray-600 text-sm">
                  Ahorra tiempo con la corrección instantánea
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg mt-1">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-900">
                  Análisis de resultados
                </h3>
                <p className="text-gray-600 text-sm">
                  Obtén estadísticas detalladas del desempeño
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}