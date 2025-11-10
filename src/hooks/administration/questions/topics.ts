import { useQuestionBankContext } from "./context";

export const useTopics = () => {
  const {
    topics,
    loading,
    error,
    refresh,
    createTopic,
    updateTopic,
    deleteTopic,
  } = useQuestionBankContext();

  return {
    topics,
    loading,
    error,
    refresh,
    createTopic,
    updateTopic,
    deleteTopic,
  };
};
