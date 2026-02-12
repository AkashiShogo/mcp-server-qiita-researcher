/**
 * Query builder utilities for Qiita API search
 */

import { TREND_THRESHOLDS } from '../constants.js';
import { TrendScope } from '../types.js';
import { getDateDaysAgo } from './dateUtils.js';

/**
 * Build a search query with stocks threshold filter
 * @param baseQuery - User's search keywords
 * @param stocksThreshold - Minimum stocks count (0 to disable filtering)
 * @returns Complete query string
 */
export function buildSearchQuery(baseQuery: string, stocksThreshold: number): string {
  const parts = [baseQuery];

  if (stocksThreshold > 0) {
    parts.push(`stocks:>${stocksThreshold}`);
  }

  return parts.join(' ');
}

/**
 * Build a trend query based on scope and optional topic
 * @param scope - Time period (weekly, monthly, new_arrival)
 * @param topic - Optional tag filter
 * @returns Complete query string
 */
export function buildTrendQuery(scope: TrendScope, topic?: string): string {
  const config = TREND_THRESHOLDS[scope];
  const date = getDateDaysAgo(config.days);

  const parts = [
    `created:>${date}`,
    `stocks:>${config.stocks}`
  ];

  if (topic) {
    parts.push(`tag:${topic}`);
  }

  return parts.join(' ');
}
