/**
 * Type definitions and Zod schemas for Qiita API and tool inputs
 */

import { z } from 'zod';

// ============================================================================
// Tool Input Schemas
// ============================================================================

export const SearchArticlesInputSchema = z.object({
  query: z.string().min(1).describe('検索キーワード'),
  sort: z.enum(['rel', 'stock']).default('rel').describe('ソート順: rel (関連度順) または stock (ストック数順)'),
  threshold_stocks: z.number().int().min(0).default(10).describe('最低ストック数（この数以下の記事を除外）')
});

export const GetTechTrendsInputSchema = z.object({
  scope: z.enum(['weekly', 'monthly', 'new_arrival']).describe('期間: weekly (週間)、monthly (月間)、new_arrival (最新)'),
  topic: z.string().optional().describe('特定のタグで絞り込む場合に指定（例: "TypeScript", "React"）')
});

export const ReadArticleSmartInputSchema = z.object({
  item_id: z.string().min(1).describe('Qiita記事ID（URLの末尾の英数字文字列）')
});

export type SearchArticlesInput = z.infer<typeof SearchArticlesInputSchema>;
export type GetTechTrendsInput = z.infer<typeof GetTechTrendsInputSchema>;
export type ReadArticleSmartInput = z.infer<typeof ReadArticleSmartInputSchema>;

// ============================================================================
// Qiita API Response Schemas
// ============================================================================

export const QiitaUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  profile_image_url: z.string().optional()
});

export const QiitaTagSchema = z.object({
  name: z.string(),
  versions: z.array(z.string()).optional()
});

export const QiitaArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  likes_count: z.number(),
  stocks_count: z.number(),
  comments_count: z.number().optional(),
  tags: z.array(QiitaTagSchema),
  user: QiitaUserSchema
});

export const QiitaCommentSchema = z.object({
  id: z.string(),
  body: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  reactions_count: z.number(),
  user: QiitaUserSchema
});

export type QiitaUser = z.infer<typeof QiitaUserSchema>;
export type QiitaTag = z.infer<typeof QiitaTagSchema>;
export type QiitaArticle = z.infer<typeof QiitaArticleSchema>;
export type QiitaComment = z.infer<typeof QiitaCommentSchema>;

// ============================================================================
// Helper Types
// ============================================================================

export type TrendScope = 'weekly' | 'monthly' | 'new_arrival';
export type SortOrder = 'rel' | 'stock';
