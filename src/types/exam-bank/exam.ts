export type TopicProportion = Record<string, number>;

export type TopicCoverage = {
  topicIds: string[];
  minPerTopic: number;
};

export type ExamQuestionAssignment = {
  id: string;
  examId: string;
  questionId: string;
  questionIndex: number;
};

export type ExamDetail = {
  id: string;
  title: string;
  subjectId: string;
  difficulty: string;
  examStatus: string;
  authorId: string;
  validatorId?: string | null;
  observations?: string | null;
  questionCount: number;
  topicProportion?: TopicProportion | null;
  topicCoverage?: TopicCoverage | null;
  validatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  questions?: ExamQuestionAssignment[] | null;
};


export type CreateManualExamPayload = {
  title: string;
  subjectId: string;
  questions: Array<{ questionId: string; questionIndex: number }>;
};

export type CreateAutomaticExamPayload = {
  title: string;
  subjectId: string;
  questionCount: number;
  questionTypeDistribution: Array<{ type: string; count: number }>;
  difficultyDistribution: Array<{ difficulty: string; count: number }>;
  topicCoverage?: string[];
  subtopicDistribution?: Array<{ subtopic: string; count: number }>;
};

export type UpdateExamPayload = {
  questions: Array<{ questionId: string; questionIndex: number }>;
};

export type AutomaticExamPreviewQuestion = {
  questionId: string;
  questionIndex: number;
  difficulty: string;
  questionTypeId: string;
  subTopicId: string;
  topicId: string;
  body: string;
  options?: Array<{ text: string; isCorrect: boolean }>;
  response?: string | null;
};

export type AutomaticExamPreview = {
  title: string;
  subjectId: string;
  difficulty: string;
  examStatus: string;
  authorId: string;
  validatorId?: string | null;
  observations?: string | null;
  questionCount: number;
  topicProportion?: TopicProportion | null;
  topicCoverage?: TopicCoverage | null;
  questions: AutomaticExamPreviewQuestion[];
};
