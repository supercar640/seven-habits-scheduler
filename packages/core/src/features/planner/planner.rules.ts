/** Recommended maximum number of big-rock (Q2) tasks to commit to in a single week. */
export const BIG_ROCK_SOFT_LIMIT = 6;

export interface BigRockEvaluation {
  count: number;
  withinRecommended: boolean;
  warning?: string;
}

/**
 * Evaluates a week's chosen big-rock task ids against the soft recommendation. Never blocks:
 * returns a `warning` when the count exceeds BIG_ROCK_SOFT_LIMIT so callers can surface guidance
 * while still allowing the selection.
 */
export function evaluateBigRocks(taskIds: string[]): BigRockEvaluation {
  const count = taskIds.length;
  const withinRecommended = count <= BIG_ROCK_SOFT_LIMIT;

  if (withinRecommended) {
    return { count, withinRecommended };
  }

  return {
    count,
    withinRecommended,
    warning: `You selected ${count} big rocks; the recommended weekly limit is ${BIG_ROCK_SOFT_LIMIT}.`,
  };
}
