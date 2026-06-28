export type ReviewPeriodType = "weekly" | "monthly" | "yearly";

export interface ReviewInput {
  periodType: ReviewPeriodType;
  periodStartDate: string;
  wins?: string;
  misses?: string;
  lessons?: string;
  nextAdjustments?: string;
}
