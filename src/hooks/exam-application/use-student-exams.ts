"use client";

import { useCallback, useEffect, useState } from "react";
import { ExamApplicationService } from "@/services/exam-application/exam-application-service";
import { ExamAssignment, AssignedExamStatus } from "@/types/exam-application/exam";
import { StudentExamFilters } from "@/types/exam-application/filters";
import { ASSIGNMENT_GRADED_EVENT } from "@/utils/events";

const DEFAULT_PAGE_SIZE = 1;

const DEFAULT_FILTERS: StudentExamFilters = {
    status: "ALL",
    subjectId: "ALL",
    teacherId: "ALL",
};

export function useStudentExams() {
    const [exams, setExams] = useState<ExamAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(DEFAULT_PAGE_SIZE);
    const [filters, setFiltersState] = useState<StudentExamFilters>(DEFAULT_FILTERS);
    const [search, setSearchState] = useState("");

    const fetchExams = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const trimmedSearch = search.trim();
            const response = await ExamApplicationService.listStudentExams({
                ...filters,
                page,
                limit: pageSize,
                examTitle: trimmedSearch || undefined,
            });
            setExams(response.data);
            setTotal(response.meta.total);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [filters, page, pageSize, search]);

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    const setFilters = useCallback((next: StudentExamFilters) => {
        setPage(1);
        setFiltersState(next);
    }, []);

    const setSearch = useCallback((value: string) => {
        setPage(1);
        setSearchState(value);
    }, []);

    const refresh = useCallback(async () => {
        await fetchExams();
    }, [fetchExams]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const handleAssignmentGraded = () => {
            void refresh();
        };

        window.addEventListener(ASSIGNMENT_GRADED_EVENT, handleAssignmentGraded);
        return () => {
            window.removeEventListener(ASSIGNMENT_GRADED_EVENT, handleAssignmentGraded);
        };
    }, [refresh]);

    return {
        exams,
        loading,
        error,
        total,
        page,
        pageSize,
        filters,
        setPage,
        setFilters,
        search,
        setSearch,
        refresh,
    };
}
