/**
 * Qiita API Client
 * Handles all HTTP interactions with Qiita API v2
 */
import axios from 'axios';
import { QIITA_API_BASE_URL, HTTP_TIMEOUT, DEFAULT_PER_PAGE, DEFAULT_PAGE } from './constants.js';
import { QiitaArticleSchema, QiitaCommentSchema } from './types.js';
export class QiitaClient {
    axiosInstance;
    constructor(accessToken) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
        this.axiosInstance = axios.create({
            baseURL: QIITA_API_BASE_URL,
            headers,
            timeout: HTTP_TIMEOUT
        });
    }
    /**
     * Search articles with query
     * @param query - Search query string (supports Qiita query syntax)
     * @param page - Page number (default: 1)
     * @param perPage - Results per page (default: 20)
     */
    async searchArticles(query, page = DEFAULT_PAGE, perPage = DEFAULT_PER_PAGE) {
        try {
            const response = await this.axiosInstance.get('/items', {
                params: {
                    query,
                    page,
                    per_page: perPage
                }
            });
            // Validate response with Zod schema
            const articles = response.data.map((item) => QiitaArticleSchema.parse(item));
            return articles;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Get article by ID
     * @param itemId - Qiita article ID
     */
    async getArticle(itemId) {
        try {
            const response = await this.axiosInstance.get(`/items/${itemId}`);
            return QiitaArticleSchema.parse(response.data);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Get comments for an article
     * @param itemId - Qiita article ID
     */
    async getComments(itemId) {
        try {
            const response = await this.axiosInstance.get(`/items/${itemId}/comments`);
            const comments = response.data.map((item) => QiitaCommentSchema.parse(item));
            return comments;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Handle errors from Qiita API with specific handling for rate limits
     */
    handleError(error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error;
            // Rate limit (429 Too Many Requests)
            if (axiosError.response?.status === 429) {
                const retryAfter = axiosError.response.headers['retry-after'];
                if (retryAfter) {
                    // Retry-After can be in seconds (number) or HTTP date string
                    const seconds = parseInt(retryAfter, 10);
                    if (!isNaN(seconds)) {
                        const minutes = Math.ceil(seconds / 60);
                        const errorMsg = `Qiita APIのレート制限に達しました。${minutes}分後に再試行してください。`;
                        return new Error(errorMsg);
                    }
                }
                const errorMsg = 'Qiita APIのレート制限に達しました。しばらく待ってから再試行してください。';
                return new Error(errorMsg);
            }
            // 404 Not Found
            if (axiosError.response?.status === 404) {
                const errorMsg = '指定された記事が見つかりませんでした。';
                return new Error(errorMsg);
            }
            // 401 Unauthorized
            if (axiosError.response?.status === 401) {
                const errorMsg = '認証エラー: アクセストークンが無効です。';
                return new Error(errorMsg);
            }
            // 403 Forbidden
            if (axiosError.response?.status === 403) {
                const errorMsg = 'アクセスが拒否されました。';
                return new Error(errorMsg);
            }
            // Other HTTP errors
            if (axiosError.response) {
                const errorMsg = `Qiita APIエラー (${axiosError.response.status}): ${axiosError.response.statusText}`;
                return new Error(errorMsg);
            }
            // Network errors
            if (axiosError.request) {
                const errorMsg = 'ネットワークエラー: Qiita APIに接続できませんでした。';
                return new Error(errorMsg);
            }
        }
        // Unknown errors
        const errorMsg = `予期しないエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`;
        return new Error(errorMsg);
    }
}
