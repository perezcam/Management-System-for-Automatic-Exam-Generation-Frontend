"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuestionsConfigHeader } from "@/components/dashboard/administration/questions/questions-config-header";
import { QuestionTypeForm } from "@/components/dashboard/administration/questions/question-type-form";
import { QuestionTypeList } from "@/components/dashboard/administration/questions/question-type-list";
import { SubjectsTopicsManagement } from "@/components/dashboard/administration/questions/subjects-topics-management";
import { UseQuestionAdministration } from "@/hooks/questions/use-question-administration";

export default function QuestionsAdminPage() {
  const router = useRouter();

  const {
    questionTypes,
    subjects,
    topics,
    totals,
    loading,
    error,
    refresh,

    // paginación de materias
    subjectsPage,
    subjectsTotalPages,
    nextSubjectsPage,
    prevSubjectsPage,

    // paginación de tópicos
    topicsPage,
    topicsTotalPages,
    nextTopicsPage,
    prevTopicsPage,

    // acciones
    createQuestionType,
    deleteQuestionType,
    createSubject,
    updateSubject,
    deleteSubject,
    createTopic,
    updateTopic,
    deleteTopic,
    createSubtopic,
    deleteSubtopic,
  } = UseQuestionAdministration();

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Configuración de Preguntas</h2>
          <Button variant="ghost" onClick={() => router.push("/administration")}>
            Volver
          </Button>
        </div>

        <QuestionsConfigHeader
          stats={{
            totalTypes: totals.total_question_types,
            totalSubjects: totals.total_subjects,
            totalTopics: totals.total_topics,
            totalSubtopics: totals.total_subtopics,
          }}
        />

        {error && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <div className="flex items-center justify-between gap-4">
              <span>Error al cargar configuración: {error.message}</span>
              <Button variant="outline" size="sm" onClick={refresh}>
                Reintentar
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <QuestionTypeForm onCreateType={createQuestionType} />
          </div>

          <div className="lg:col-span-2">
            <QuestionTypeList
              questionTypes={questionTypes}
              onDeleteType={deleteQuestionType}
            />
          </div>
        </div>

        <SubjectsTopicsManagement
          subjects={subjects}
          topics={topics}
          loading={loading}
          // paginación materias
          subjectsPage={subjectsPage}
          subjectsTotalPages={subjectsTotalPages}
          onSubjectsPrevPage={() => { void prevSubjectsPage(); }}
          onSubjectsNextPage={() => { void nextSubjectsPage(); }}
          // paginación tópicos
          topicsPage={topicsPage}
          topicsTotalPages={topicsTotalPages}
          onTopicsPrevPage={() => { void prevTopicsPage(); }}
          onTopicsNextPage={() => { void nextTopicsPage(); }}
          // acciones
          onCreateSubject={createSubject}
          onUpdateSubject={updateSubject}
          onDeleteSubject={deleteSubject}
          onCreateTopic={createTopic}
          onUpdateTopic={updateTopic}
          onDeleteTopic={deleteTopic}
          onCreateSubtopic={createSubtopic}
          onDeleteSubtopic={deleteSubtopic}
        />
      </div>
    </div>
  );
}
