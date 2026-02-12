/**
 * Constants for Qiita API and MCP server configuration
 */
export const QIITA_API_BASE_URL = 'https://qiita.com/api/v2';
export const DEFAULT_STOCKS_THRESHOLD = 10;
export const DEFAULT_PER_PAGE = 20;
export const DEFAULT_PAGE = 1;
export const MAX_COMMENTS_TO_FETCH = 3;
export const MAX_TEXT_LENGTH = 20000;
export const TREND_THRESHOLDS = {
    weekly: { days: 7, stocks: 20 },
    monthly: { days: 30, stocks: 50 },
    new_arrival: { days: 2, stocks: 5 }
};
export const HTTP_TIMEOUT = 10000; // 10 seconds
