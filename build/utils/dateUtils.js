/**
 * Date utility functions for trend queries
 */
/**
 * Get date N days ago in YYYY-MM-DD format
 * @param daysAgo - Number of days to subtract from current date
 * @returns Date string in YYYY-MM-DD format
 */
export function getDateDaysAgo(daysAgo) {
    const now = new Date();
    const targetDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
/**
 * Build a "created:>" query part for trend searches
 * @param daysAgo - Number of days to look back
 * @returns Query string like "created:>2026-02-05"
 */
export function buildCreatedQuery(daysAgo) {
    return `created:>${getDateDaysAgo(daysAgo)}`;
}
