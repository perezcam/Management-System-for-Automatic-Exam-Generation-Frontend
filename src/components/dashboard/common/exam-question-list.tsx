"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExamQuestionListItem } from "@/types/exam-question-list";

type ExamQuestionListProps = {
  questions: ExamQuestionListItem[];
};

const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
    case "Fácil":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "Regular":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
    case "Difícil":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    case "Mixta":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  }
};

export function ExamQuestionList({ questions }: ExamQuestionListProps) {
  if (!questions.length) return null;

  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <Card key={`${question.id}-${index}`} className="p-4">
          <div className="flex items-start gap-3">
            <span className="font-medium text-sm mt-1 flex-shrink-0">{index + 1}.</span>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2 mb-2">
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
              <p className="text-sm break-words">{question.body}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
