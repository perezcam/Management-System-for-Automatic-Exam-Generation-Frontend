import { useCallback, useEffect, useState } from "react";
import type { SubjectDetail } from "@/types/question-administration/subject";
import type { TeacherUser } from "@/types/users/teacher";
import type { ExamDetail } from "@/types/exam-bank/exam";
import type { TopicDetail } from "@/types/question-administration/topic";
import { fetchSubjects } from "@/services/question-administration/subjects";
import { fetchTeachers } from "@/services/users/teachers";
import { fetchExams } from "@/services/exam-bank/exams";
import { MAX_TOPICS_LIMIT, fetchTopics } from "@/services/question-administration/topics";

export type LookupItem = { id: string; name: string };

const TEACHER_FETCH_LIMIT = 100;
const EXAM_FETCH_LIMIT = 100;
const TOPIC_FETCH_LIMIT = MAX_TOPICS_LIMIT;

const normalizeSubjectName = (subject: SubjectDetail) =>
  subject.subject_name ?? subject.name ?? subject.subject_id;

const normalizeTeacherName = (teacher: TeacherUser) => teacher.name ?? teacher.email ?? teacher.id;

const normalizeExamTitle = (exam: ExamDetail) => exam.title ?? exam.id;

export function useAnalyticsLookups() {
  const [subjects, setSubjects] = useState<LookupItem[]>([]);
  const [teachers, setTeachers] = useState<LookupItem[]>([]);
  const [exams, setExams] = useState<LookupItem[]>([]);
  const [topics, setTopics] = useState<TopicDetail[]>([]);
  const [topicMap, setTopicMap] = useState<Record<string, string>>({});
  const [topicSubtopicsMap, setTopicSubtopicsMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subjectData, teacherData, examData, topicResponse] = await Promise.all([
        fetchSubjects(),
        fetchTeachers({ limit: TEACHER_FETCH_LIMIT, offset: 0 }),
        fetchExams({ limit: EXAM_FETCH_LIMIT, offset: 0 }),
        fetchTopics({ limit: TOPIC_FETCH_LIMIT, offset: 0 }),
      ]);
      const topicData = topicResponse.data;

      setSubjects(
        subjectData.map((subject) => ({ id: subject.subject_id, name: normalizeSubjectName(subject) })),
      );
      setTeachers(teacherData.data.map((teacher) => ({ id: teacher.id, name: normalizeTeacherName(teacher) })));
      setExams(examData.data.map((exam) => ({ id: exam.id, name: normalizeExamTitle(exam) })));
      setTopics(topicData);
      setTopicMap(Object.fromEntries(topicData.map((topic) => [topic.topic_id, topic.topic_name ?? topic.topic_id])));
      setTopicSubtopicsMap(
        Object.fromEntries(
          topicData.map((topic) => [
            topic.topic_id,
            topic.subtopics?.map((sub) => sub.subtopic_name ?? sub.subtopic_id) ?? [],
          ]),
        ),
      );
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    subjects,
    teachers,
    exams,
    topics,
    topicMap,
    topicSubtopicsMap,
    loading,
    error,
    refresh,
  };
}
