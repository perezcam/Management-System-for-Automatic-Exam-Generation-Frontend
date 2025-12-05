export const TOTAL_EXAM_SCORE = 100

const roundToTwoDecimals = (value: number) => Number(value.toFixed(2))

export const distributeScoreEvenly = (count: number, total: number = TOTAL_EXAM_SCORE) => {
  if (count <= 0) return []
  const baseScore = roundToTwoDecimals(total / count)
  const scores = Array(count).fill(baseScore)
  const sum = roundToTwoDecimals(scores.reduce((acc, score) => acc + score, 0))
  const diff = roundToTwoDecimals(total - sum)

  if (Math.abs(diff) > 0) {
    const lastIndex = scores.length - 1
    scores[lastIndex] = roundToTwoDecimals(scores[lastIndex] + diff)
  }

  return scores
}

export const sumScores = (scores: number[]) =>
  roundToTwoDecimals(scores.reduce((acc, score) => acc + score, 0))

export const isScoreSumValid = (scores: number[], total: number = TOTAL_EXAM_SCORE) =>
  Math.abs(sumScores(scores) - total) < 1e-6

export const sanitizeScoreValue = (value: number) => {
  if (!Number.isFinite(value)) return 0
  return roundToTwoDecimals(Math.max(0, Math.min(TOTAL_EXAM_SCORE, value)))
}
