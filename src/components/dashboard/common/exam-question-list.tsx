"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExamQuestionListItem } from "@/types/exam-question-list";
import type React from "react";

type ExamQuestionListProps = {
  questions: ExamQuestionListItem[];
};

type NormalizedOption = {
  text: string;
  isCorrect: boolean;
};

function normalizeDifficulty(input?: string) {
  const raw = (input ?? "").trim();

  // Arreglos comunes por encoding raro / variantes
  const fixed = raw
    .replace(/FA�cil/gi, "Fácil")
    .replace(/DifA-cil/gi, "Difícil");

  // Normalización: sin tildes y en minúsculas
  return fixed
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getDifficultyStyle(difficulty?: string): React.CSSProperties {
  const d = normalizeDifficulty(difficulty);

  switch (d) {
    case "facil":
      return { backgroundColor: "#dcfce7", color: "#15803d" }; // green-100 / green-700
    case "regular":
      return { backgroundColor: "#fef9c3", color: "#a16207" }; // yellow-100 / yellow-700
    case "dificil":
      return { backgroundColor: "#fee2e2", color: "#b91c1c" }; // red-100 / red-700
    case "mixta":
      return { backgroundColor: "#dbeafe", color: "#1d4ed8" }; // blue-100 / blue-700-ish
    default:
      return { backgroundColor: "#f3f4f6", color: "#374151" }; // gray-100 / gray-700
  }
}

const normalizeQuestionOptions = (options?: ExamQuestionListItem["options"]): NormalizedOption[] => {
  if (!options?.length) return [];
  return options
    .map((option) => {
      if (typeof option === "string") {
        const text = option.trim();
        return text ? { text, isCorrect: false } : null;
      }
      if (!option || typeof option.text !== "string") return null;
      const text = option.text.trim();
      if (!text) return null;
      return { text, isCorrect: Boolean(option.isCorrect) };
    })
    .filter((option): option is NormalizedOption => Boolean(option));
};

const getOptionLabel = (index: number) => {
  const baseCode = "A".charCodeAt(0);
  const charCode = baseCode + index;
  if (charCode <= "Z".charCodeAt(0)) return String.fromCharCode(charCode);
  return `${index + 1}`;
};

export function ExamQuestionList({ questions }: ExamQuestionListProps) {
  if (!questions.length) return null;

  return (
    <div className="space-y-3">
      {questions.map((question, index) => {
        const normalizedOptions = normalizeQuestionOptions(question.options);
        const hasResponse = typeof question.response === "string" && question.response.trim().length > 0;
        const shouldShowResponse = hasResponse || normalizedOptions.length === 0;

        const difficultyText = (question.difficulty ?? "Regular").trim();
        const difficultyStyle = getDifficultyStyle(difficultyText);

        return (
          <Card key={`${question.id}-${index}`} className="p-4">
            <div className="flex items-start gap-3">
              <span className="font-medium text-sm mt-1 flex-shrink-0">{index + 1}.</span>

              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {question.subtopic ? (
                    <Badge variant="outline" className="text-xs">
                      {question.subtopic}
                    </Badge>
                  ) : null}

                  <Badge className="text-xs" style={difficultyStyle}>
                    {difficultyText}
                  </Badge>

                  {question.type ? (
                    <Badge variant="secondary" className="text-xs">
                      {question.type}
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm break-words">{question.body}</p>

                  {normalizedOptions.length > 0 ? (
                    <div className="space-y-2">
                      {normalizedOptions.map((option, optIndex) => {
                        const Icon = option.isCorrect ? CheckCircle2 : Circle;
                        return (
                          <div
                            key={`${question.id}-option-${optIndex}`}
                            className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${
                              option.isCorrect
                                ? "border-green-200 bg-green-50 text-green-900"
                                : "border-border bg-muted/30 text-foreground"
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                                option.isCorrect ? "text-green-600" : "text-muted-foreground"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold mr-2 text-foreground">
                                {getOptionLabel(optIndex)}.
                              </span>
                              <span className="break-words">{option.text}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {shouldShowResponse ? (
                    <p className="text-xs text-muted-foreground break-words">
                      <span className="font-semibold text-foreground">Respuesta:</span>{" "}
                      {hasResponse ? question.response : "Sin respuesta proporcionada"}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
