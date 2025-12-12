"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExamQuestionListItem } from "@/types/exam-question-list";

type ExamQuestionListProps = {
  questions: ExamQuestionListItem[];
};

type NormalizedOption = {
  text: string;
  isCorrect: boolean;
};

const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
    case "FA�cil":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "Regular":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
    case "DifA-cil":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    case "Mixta":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  }
};

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
  if (charCode <= "Z".charCodeAt(0)) {
    return String.fromCharCode(charCode);
  }
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
                  <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty ?? "Regular"}
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
                              <span className="font-semibold mr-2 text-foreground">{getOptionLabel(optIndex)}.</span>
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
