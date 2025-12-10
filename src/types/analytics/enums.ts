export enum AutomaticExamSortByEnum {
  CREATED_AT = "createdAt",
  SUBJECT_NAME = "subjectName",
  CREATOR_NAME = "creatorName",
}

export enum PopularQuestionSortByEnum {
  USAGE_COUNT = "usageCount",
  DIFFICULTY = "difficulty",
  TOPIC_NAME = "topicName",
}

export enum ValidatedExamSortByEnum {
  VALIDATED_AT = "validatedAt",
  SUBJECT_NAME = "subjectName",
}

export enum ReviewerActivitySortByEnum {
  REVIEWED_EXAMS = "reviewedExams",
  TEACHER_NAME = "teacherName",
  SUBJECT_NAME = "subjectName",
}

export enum SubjectDifficultySortByEnum {
  SUBJECT_NAME = "subjectName",
}

export enum ExamComparisonSortByEnum {
  SUBJECT_NAME = "subjectName",
  EXAM_TITLE = "examTitle",
  CREATED_AT = "createdAt",
}

export enum SortDirectionEnum {
  ASC = "asc",
  DESC = "desc",
}

export enum ReportFormatEnum {
  JSON = "json",
  PDF = "pdf",
}
