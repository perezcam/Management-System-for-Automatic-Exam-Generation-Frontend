import { useQuestionBankContext } from "./context";

export const useQuestionTypes = () => {
  const {
    questionTypes,
    loading,
    error,
    refresh,
    createQuestionType,
    deleteQuestionType,
  } = useQuestionBankContext();

  return {
    questionTypes,
    loading,
    error,
    refresh,
    createQuestionType,
    deleteQuestionType,
  };
};
