# mcp-server-qiita-researcher

**Not just an API wrapper, but a Research Assistant.**

[日本語版README](./README.ja.md)

An intelligent MCP (Model Context Protocol) server for Qiita that goes beyond simple API wrapping to provide high-value research capabilities tailored for AI assistants like Claude.

## Why This MCP Server?

Most Qiita MCP servers are just thin wrappers around the Qiita API. **mcp-server-qiita-researcher** differentiates itself with three key innovations:

### 🎯 1. Smart Reading: Article + Valuable Comments

The **killer feature** - fetch not just the article, but also the most valuable comments (sorted by reactions) in a single call. This provides richer context and community insights that pure article content misses.

- Parallel API calls for speed
- Top 3 comments with highest reactions
- Clean HTML removal for token efficiency

### 📈 2. Trend Scouting: One-Click Trend Discovery

Discover what's trending on Qiita without complex query syntax or date calculations.

- `weekly`: Last 7 days, 20+ stocks
- `monthly`: Last 30 days, 50+ stocks
- `new_arrival`: Last 2 days, 5+ stocks
- Optional topic filtering

### 🔍 3. Noise Reduction: Quality-First Search

Automatically filter out low-quality articles by default (configurable stock threshold).

- Auto-appends `stocks:>N` to queries
- Removes token-heavy HTML (iframes, images, scripts)
- Smart truncation at paragraph boundaries

---

## Features

- **Three Intelligent Tools:**
  - `search_articles` - Quality-focused article search
  - `get_tech_trends` - One-shot trend gathering
  - `read_article_smart` - Article + valuable comments in one call

- **Token Efficiency:**
  - HTML cleanup using cheerio
  - Smart text truncation (20,000 char limit)
  - Removes noise, keeps signal

- **Robust Error Handling:**
  - Rate limit detection (429) with specific retry times
  - Actionable error messages in Japanese
  - Graceful degradation

- **Type Safety:**
  - Full TypeScript implementation
  - Zod schemas for runtime validation
  - Comprehensive error types

---

## Installation

### Prerequisites

- **Node.js 18 or higher** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Claude Desktop** or **Claude Code CLI**

### Step 1: Clone and Build

```bash
# Clone this repository
git clone https://github.com/yourusername/mcp-server-qiita-researcher.git
cd mcp-server-qiita-researcher

# Install dependencies
npm install

# Build the project
npm run build
```

After building, you should see a `build/` directory with compiled JavaScript files.

### Step 2: Get Your Qiita Access Token (Optional but Recommended)

Without a token, you're limited to **60 requests/hour**. With a token, you get **1000 requests/hour**.

1. Go to [Qiita Token Settings](https://qiita.com/settings/tokens/new)
2. Create a new token with read permissions
3. Copy the token (you'll need it in the next step)

---

## Configuration

Choose your environment:

### Option A: Claude Desktop

**macOS/Linux:**

1. Open the configuration file:
   ```bash
   # macOS
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json

   # Linux
   nano ~/.config/Claude/claude_desktop_config.json
   ```

2. Add the server configuration:
   ```json
   {
     "mcpServers": {
       "qiita-researcher": {
         "command": "node",
         "args": ["/absolute/path/to/mcp-server-qiita-researcher/build/index.js"],
         "env": {
           "QIITA_ACCESS_TOKEN": "your_token_here_or_leave_empty"
         }
       }
     }
   }
   ```

3. **Important:** Replace `/absolute/path/to/mcp-server-qiita-researcher` with the actual path. You can get it with:
   ```bash
   pwd
   ```

4. Restart Claude Desktop

**Windows:**

1. Open the configuration file at:
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. Add the same configuration (use forward slashes in the path)

3. Restart Claude Desktop

### Option B: Claude Code CLI

**Step-by-step setup:**

1. Check your current working directory:
   ```bash
   pwd
   # Example output: /Users/yourname/projects/mcp-server-qiita-researcher
   ```

2. Edit the Claude configuration file:
   ```bash
   # Option 1: Using jq (recommended)
   jq '.mcpServers["qiita-researcher"] = {
     "command": "node",
     "args": ["/absolute/path/to/mcp-server-qiita-researcher/build/index.js"],
     "env": {"QIITA_ACCESS_TOKEN": ""}
   }' ~/.claude.json > ~/.claude.json.tmp && mv ~/.claude.json.tmp ~/.claude.json

   # Option 2: Manual editing
   nano ~/.claude.json
   ```

3. If editing manually, add this to the root level of the JSON:
   ```json
   {
     "mcpServers": {
       "qiita-researcher": {
         "command": "node",
         "args": ["/absolute/path/to/mcp-server-qiita-researcher/build/index.js"],
         "env": {
           "QIITA_ACCESS_TOKEN": ""
         }
       }
     },
     "...other existing settings...": "..."
   }
   ```

4. Verify the configuration:
   ```bash
   jq '.mcpServers["qiita-researcher"]' ~/.claude.json
   ```

   You should see your configuration printed.

5. Start a fresh Claude Code session:
   ```bash
   # Start from outside the project directory
   cd ~
   claude
   ```

---

## Usage Examples

### Example 1: Search for TypeScript Articles

Ask Claude:
```
Qiitaで「TypeScript 型推論」に関する記事を検索して
```

Claude will use the `search_articles` tool and return high-quality articles with 10+ stocks.

### Example 2: Get Weekly Trends

Ask Claude:
```
Qiitaの今週のトレンド記事を教えて
```

Claude will use the `get_tech_trends` tool with `scope: "weekly"`.

### Example 3: Read an Article with Comments

Ask Claude:
```
このQiita記事を詳しく読んで要約して: https://qiita.com/username/items/abc123def456
```

Claude will extract the article ID and use `read_article_smart` to fetch the article plus top 3 valuable comments.

---

## Tool Reference

### 1. `search_articles`

Search Qiita articles with automatic quality filtering.

**Parameters:**
- `query` (string, required): Search keywords
- `sort` (enum, optional): Sort order
  - `rel` (default): Relevance
  - `stock`: Stock count
- `threshold_stocks` (number, optional): Minimum stock count filter (default: 10)

**Example:**
```json
{
  "query": "React hooks",
  "sort": "stock",
  "threshold_stocks": 20
}
```

**What it does:**
- Automatically adds `stocks:>N` filter to exclude low-quality articles
- Sorts by relevance or stock count
- Returns clean, token-efficient article summaries

---

### 2. `get_tech_trends`

Get trending articles with one click.

**Parameters:**
- `scope` (enum, required): Time period
  - `weekly`: Last 7 days, 20+ stocks
  - `monthly`: Last 30 days, 50+ stocks
  - `new_arrival`: Last 2 days, 5+ stocks
- `topic` (string, optional): Filter by tag (e.g., "React", "TypeScript", "AI")

**Example:**
```json
{
  "scope": "weekly",
  "topic": "React"
}
```

**What it does:**
- Automatically calculates date ranges
- Applies appropriate stock thresholds
- Returns trending articles without complex query syntax

---

### 3. `read_article_smart` ⭐ Killer Feature

Fetch article with top valuable comments in one call.

**Parameters:**
- `item_id` (string, required): Qiita article ID from URL
  - Example: For `https://qiita.com/username/items/abc123def456`, use `abc123def456`

**Example:**
```json
{
  "item_id": "abc123def456"
}
```

**What You Get:**
- Article metadata (title, author, created date, stocks, likes, tags)
- Cleaned article body (HTML removed for token efficiency)
- Top 3 comments sorted by reaction count
- Community insights and additional tips from comments
- Smart truncation if content exceeds 20,000 characters

**Why it's powerful:**
- Single API call fetches article + comments in parallel
- Discovers valuable community feedback automatically
- Provides richer context than article-only tools

---

## Troubleshooting

### MCP Server Not Loading

**Symptoms:**
- Claude doesn't recognize the Qiita tools
- No tools appear in Claude's tool list

**Solutions:**

1. **Verify the build:**
   ```bash
   ls build/index.js
   # Should show: build/index.js
   ```

2. **Check configuration path:**
   ```bash
   # Get absolute path
   cd /path/to/mcp-server-qiita-researcher
   pwd

   # Verify it matches your config
   cat ~/.claude.json | jq '.mcpServers["qiita-researcher"].args'
   ```

3. **Test the server manually:**
   ```bash
   node build/index.js
   # Should output: "Qiita Researcher MCP Server started successfully"
   # Press Ctrl+C to stop
   ```

4. **Restart Claude completely:**
   - Close all Claude sessions
   - Start a fresh session

5. **Check debug logs (Claude Code CLI only):**
   ```bash
   ls -lt ~/.claude/debug/ | head -5
   # Check the latest log file
   grep -i "qiita" ~/.claude/debug/latest
   ```

### Rate Limit Errors

**Symptoms:**
- Error: "Qiita APIのレート制限に達しました"

**Solutions:**
1. Wait for the specified time (shown in error message)
2. Add a Qiita access token to your configuration (increases limit from 60 to 1000 req/hour)

### Article Not Found

**Symptoms:**
- Error: "指定された記事が見つかりませんでした"

**Solutions:**
1. Verify the article ID is correct
2. Check if the article is public (not private or deleted)

---

## Development

### Project Structure

```
src/
├── index.ts              # MCP server entry point + tool registration
├── qiitaClient.ts        # Qiita API client with error handling
├── types.ts              # Zod schemas + TypeScript types
├── constants.ts          # Configuration constants
└── utils/
    ├── dateUtils.ts      # Date calculations for trends
    ├── queryBuilder.ts   # Query construction logic
    ├── htmlCleaner.ts    # Cheerio-based HTML cleanup
    └── textTruncator.ts  # Smart truncation + article/comment combiner
```

### Development Commands

```bash
# Build the project
npm run build

# Watch mode (rebuild on changes)
npm run dev

# Start the server directly
npm start
```

### Testing

Test the server using Claude Desktop or Claude Code CLI:

1. **search_articles**: Should return quality articles with stocks > threshold
2. **get_tech_trends**: Should return recent trending articles
3. **read_article_smart**: Should return article + top 3 comments combined

---

## Error Handling

The server provides actionable error messages:

- **Rate Limit (429):** Specific wait time extracted from `Retry-After` header
- **Not Found (404):** Clear "article not found" message
- **Unauthorized (401):** Invalid access token
- **Network Errors:** Connection failure messages

All error messages are in Japanese for better readability.

---

## Comparison with Other Qiita MCP Servers

| Feature | mcp-server-qiita-researcher | Other Qiita Servers |
|---------|----------------------------|---------------------|
| Article + Comments in one call | ✅ Yes (parallel) | ❌ No |
| Auto quality filtering | ✅ Yes (stocks threshold) | ❌ No |
| Trend queries without date math | ✅ Yes (scope-based) | ❌ No |
| HTML cleanup for tokens | ✅ Yes (cheerio-based) | ❌ No |
| Smart text truncation | ✅ Yes (paragraph-aware) | ❌ No |
| Detailed error messages | ✅ Yes (Japanese) | ⚠️ Basic |

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## Author

AKASHI SHOGO

---

## Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- Powered by [Qiita API v2](https://qiita.com/api/v2/docs)
