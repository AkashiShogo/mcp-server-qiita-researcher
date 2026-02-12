#!/usr/bin/env node
/**
 * Qiita Researcher MCP Server
 * A sophisticated research assistant for Qiita - not just an API wrapper
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { QiitaClient } from './qiitaClient.js';
import { buildSearchQuery, buildTrendQuery } from './utils/queryBuilder.js';
import { combineArticleAndComments, formatSearchResults } from './utils/textTruncator.js';
import { SearchArticlesInputSchema, GetTechTrendsInputSchema, ReadArticleSmartInputSchema, } from './types.js';
// Initialize Qiita API client with optional access token
const qiitaClient = new QiitaClient(process.env.QIITA_ACCESS_TOKEN);
// Create MCP server instance
const server = new Server({
    name: 'mcp-server-qiita-researcher',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// ============================================================================
// Tool Registration: List available tools
// ============================================================================
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'search_articles',
                description: `Qiita記事を検索します。デフォルトでストック数によるフィルタリングを行い、質の高い記事を優先的に取得します。ノイズの多い低品質な記事を自動的に除外することで、信頼性の高い情報を効率的に見つけることができます。

使用例:
- 「TypeScript 型推論」で検索し、ストック数10以上の記事のみ取得
- 人気順にソートして最も参考にされている記事を発見
- threshold_stocksを調整して品質基準を変更可能`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: '検索キーワード（例: "React hooks", "TypeScript"）',
                        },
                        sort: {
                            type: 'string',
                            enum: ['rel', 'stock'],
                            default: 'rel',
                            description: 'ソート順: rel (関連度順) または stock (ストック数順)',
                        },
                        threshold_stocks: {
                            type: 'number',
                            default: 10,
                            description: '最低ストック数（この数以下の記事を除外して品質を担保）',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'get_tech_trends',
                description: `Qiitaのトレンド記事を取得します。weekly（週間）、monthly（月間）、new_arrival（最新）のスコープから選択でき、複雑な日付計算やクエリ構築は自動で行われます。「今、何が流行っているか」をワンアクションで把握できます。

使用例:
- weekly: 過去7日間でストック数20以上の記事を取得
- monthly: 過去30日間でストック数50以上の記事を取得
- new_arrival: 過去2日間でストック数5以上の最新記事を取得
- topic指定で特定の技術領域のトレンドに絞り込み`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        scope: {
                            type: 'string',
                            enum: ['weekly', 'monthly', 'new_arrival'],
                            description: '期間: weekly (週間トレンド)、monthly (月間トレンド)、new_arrival (最新記事)',
                        },
                        topic: {
                            type: 'string',
                            description: '特定のタグで絞り込む場合に指定（例: "TypeScript", "React", "AI"）',
                        },
                    },
                    required: ['scope'],
                },
            },
            {
                name: 'read_article_smart',
                description: `Qiita記事の本文と、最も有益なコメント（リアクション数が多い上位3件）を取得します。これがこのサーバーの「キラー機能」です。記事とコメントを並列取得し、HTMLをクリーンアップして、AIが理解しやすい形式に変換します。

特徴:
- 記事本文 + 価値の高いコメントを一度に取得
- 並列API呼び出しで高速レスポンス
- HTMLタグを除去してトークン効率を最大化
- 20,000文字を超える場合は賢く切り詰め

使用例:
- 記事を読みながら、コミュニティの有益なフィードバックも同時に確認
- 記事だけでは分からない実践的なTipsをコメントから発見
- 技術的な議論や補足情報を効率的に収集`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        item_id: {
                            type: 'string',
                            description: 'Qiita記事ID（URLの末尾の英数字文字列、例: "abc123def456"）',
                        },
                    },
                    required: ['item_id'],
                },
            },
        ],
    };
});
// ============================================================================
// Tool Execution: Handle tool calls
// ============================================================================
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            // --------------------------------------------------------------------
            // Tool 1: search_articles
            // --------------------------------------------------------------------
            case 'search_articles': {
                const input = SearchArticlesInputSchema.parse(args);
                const searchQuery = buildSearchQuery(input.query, input.threshold_stocks);
                const articles = await qiitaClient.searchArticles(searchQuery);
                const formattedResults = formatSearchResults(articles);
                return {
                    content: [
                        {
                            type: 'text',
                            text: formattedResults,
                        },
                    ],
                };
            }
            // --------------------------------------------------------------------
            // Tool 2: get_tech_trends
            // --------------------------------------------------------------------
            case 'get_tech_trends': {
                const input = GetTechTrendsInputSchema.parse(args);
                const trendQuery = buildTrendQuery(input.scope, input.topic);
                const articles = await qiitaClient.searchArticles(trendQuery);
                const formattedResults = formatSearchResults(articles);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `# Qiita トレンド (${input.scope}${input.topic ? ` - ${input.topic}` : ''})\n\n${formattedResults}`,
                        },
                    ],
                };
            }
            // --------------------------------------------------------------------
            // Tool 3: read_article_smart (Killer Feature)
            // --------------------------------------------------------------------
            case 'read_article_smart': {
                const input = ReadArticleSmartInputSchema.parse(args);
                // Parallel API calls for efficiency
                const [article, comments] = await Promise.all([
                    qiitaClient.getArticle(input.item_id),
                    qiitaClient.getComments(input.item_id),
                ]);
                // Combine article and top comments
                const combinedText = combineArticleAndComments(article, comments);
                return {
                    content: [
                        {
                            type: 'text',
                            text: combinedText,
                        },
                    ],
                };
            }
            // --------------------------------------------------------------------
            // Unknown tool
            // --------------------------------------------------------------------
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        // Return error message to user
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: `エラーが発生しました: ${errorMessage}`,
                },
            ],
            isError: true,
        };
    }
});
// ============================================================================
// Server Initialization
// ============================================================================
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // Log to stderr (stdout is reserved for MCP protocol messages)
    console.error('Qiita Researcher MCP Server started successfully');
    console.error('Version: 1.0.0');
    console.error('Capabilities: search_articles, get_tech_trends, read_article_smart');
}
main().catch((error) => {
    console.error('Fatal error starting server:', error);
    process.exit(1);
});
