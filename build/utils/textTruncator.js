/**
 * Text truncation and article+comment combination utilities
 * Implements the "killer feature" of combining articles with valuable comments
 */
import { MAX_TEXT_LENGTH, MAX_COMMENTS_TO_FETCH } from '../constants.js';
import { cleanHtml } from './htmlCleaner.js';
/**
 * Truncate text at a smart boundary (paragraph break when possible)
 * @param text - Text to truncate
 * @param maxChars - Maximum character length
 * @returns Truncated text with indicator
 */
export function truncateText(text, maxChars = MAX_TEXT_LENGTH) {
    if (text.length <= maxChars) {
        return text;
    }
    // Try to truncate at paragraph boundary
    const truncated = text.substring(0, maxChars);
    const lastParagraphBreak = truncated.lastIndexOf('\n\n');
    // If we found a paragraph break in the last 20% of the truncation point, use it
    if (lastParagraphBreak > maxChars * 0.8) {
        return truncated.substring(0, lastParagraphBreak) + '\n\n[...内容が長いため省略されました]';
    }
    // Otherwise, just truncate at the character limit
    return truncated + '\n[...内容が長いため省略されました]';
}
/**
 * Combine article and top comments into a single formatted text
 * This is the "killer feature" that differentiates this MCP server
 *
 * @param article - Qiita article object
 * @param comments - Array of comments (will be sorted by reactions_count)
 * @returns Combined text with article + top valuable comments
 */
export function combineArticleAndComments(article, comments) {
    // Clean the article body
    const cleanedBody = cleanHtml(article.body);
    // Sort comments by reactions_count (descending) and take top 3
    const topComments = comments
        .sort((a, b) => b.reactions_count - a.reactions_count)
        .slice(0, MAX_COMMENTS_TO_FETCH);
    // Build the combined text
    let combined = '';
    // Article header with metadata
    combined += `# ${article.title}\n\n`;
    combined += `**作成日:** ${article.created_at}\n`;
    combined += `**更新日:** ${article.updated_at}\n`;
    combined += `**ストック数:** ${article.stocks_count}\n`;
    combined += `**LGTM数:** ${article.likes_count}\n`;
    combined += `**著者:** ${article.user.name} (@${article.user.id})\n`;
    // Tags
    if (article.tags.length > 0) {
        const tagNames = article.tags.map(tag => tag.name).join(', ');
        combined += `**タグ:** ${tagNames}\n`;
    }
    combined += `**URL:** ${article.url}\n\n`;
    combined += '---\n\n';
    // Article body
    combined += cleanedBody;
    // Add comments section if there are valuable comments
    if (topComments.length > 0) {
        combined += '\n\n---\n\n';
        combined += '## 有益なコメント\n\n';
        topComments.forEach((comment, index) => {
            const cleanedComment = cleanHtml(comment.body);
            combined += `### コメント ${index + 1} (リアクション数: ${comment.reactions_count})\n\n`;
            combined += `**投稿者:** ${comment.user.name} (@${comment.user.id})\n`;
            combined += `**投稿日:** ${comment.created_at}\n\n`;
            combined += cleanedComment;
            combined += '\n\n';
        });
    }
    // Truncate if necessary
    return truncateText(combined);
}
/**
 * Format search results into a readable text summary
 * @param articles - Array of articles from search
 * @returns Formatted text summary
 */
export function formatSearchResults(articles) {
    if (articles.length === 0) {
        return '検索結果が見つかりませんでした。';
    }
    let result = `検索結果: ${articles.length}件の記事が見つかりました\n\n`;
    articles.forEach((article, index) => {
        result += `## ${index + 1}. ${article.title}\n`;
        result += `- **ID:** ${article.id}\n`;
        result += `- **URL:** ${article.url}\n`;
        result += `- **ストック数:** ${article.stocks_count} | **LGTM数:** ${article.likes_count}\n`;
        result += `- **著者:** ${article.user.name} (@${article.user.id})\n`;
        result += `- **作成日:** ${article.created_at}\n`;
        if (article.tags.length > 0) {
            const tagNames = article.tags.map(tag => tag.name).join(', ');
            result += `- **タグ:** ${tagNames}\n`;
        }
        result += '\n';
    });
    return result;
}
