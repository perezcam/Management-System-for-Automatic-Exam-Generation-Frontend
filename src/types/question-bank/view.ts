export type QuestionTypeOption = {
  id: string;
  name: string;
};

export type TopicOption = {
  id: string;
  name: string;
  subtopics: string[];
};

export type QuestionListItem = {
  id: string;
  subtopic: string;
  difficulty: "Fácil" | "Regular" | "Difícil";
  body: string;
  type: string;
  expectedAnswer: string;
  author: string;
  options?: string[];
};

export type QuestionFilterValues = {
  subtopic: string;
  type: string;
  difficulty: string;
};
