export type TopicProportion = Record<string, number>;

export type TopicCoverage = {
  topicIds: string[];
  minPerTopic: number;
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
};
