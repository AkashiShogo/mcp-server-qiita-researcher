# mcp-server-qiita-researcher

**Not just an API wrapper, but a Research Assistant.**

[![npm version](https://img.shields.io/npm/v/mcp-server-qiita-researcher)](https://www.npmjs.com/package/mcp-server-qiita-researcher)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=flat&logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/akashishogo)

[日本語版README](./README.md)

---

## ⚡ Get Started in 3 Seconds

**Just paste this into your Claude Desktop config file:**

```json
{
  "mcpServers": {
    "qiita-researcher": {
      "command": "npx",
      "args": ["-y", "mcp-server-qiita-researcher"],
      "env": {
        "QIITA_ACCESS_TOKEN": ""
      }
    }
  }
}
```

**Restart Claude Desktop** → Done 🎉

<details>
<summary>📁 Find your config file location</summary>

**Claude Desktop:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

Create the file if it doesn't exist.

</details>

<details>
<summary>🔑 Add Qiita Access Token (Optional but Recommended)</summary>

**Without token:** 60 requests/hour
**With token:** 1000 requests/hour

1. Go to [Qiita Token Settings](https://qiita.com/settings/tokens/new)
2. Create a new token with read permissions
3. Paste the token into `QIITA_ACCESS_TOKEN` above

</details>

---

## Why This MCP Server?

Most Qiita MCP servers are just thin wrappers around the Qiita API.
**mcp-server-qiita-researcher** differentiates itself with three key innovations:

### 🎯 Smart Reading: Article + Valuable Comments

**Killer feature** - Fetch not just the article, but also the most valuable comments (sorted by reactions, TOP 3) in a single call

- Parallel API calls for speed
- Automatically gather community insights
- Clean HTML removal for token efficiency

### 📈 Trend Scouting: One-Click Trend Discovery

Discover what's trending on Qiita without complex query syntax or date calculations

- `weekly`: Last 7 days, 20+ stocks
- `monthly`: Last 30 days, 50+ stocks
- `new_arrival`: Last 2 days, 5+ stocks
- Optional topic filtering

### 🔍 Noise Reduction: Quality-First Search

Automatically filter out low-quality articles by default (configurable stock threshold)

- Auto-appends `stocks:>N` filter to queries
- Removes token-heavy HTML (iframes, images, scripts)
- Smart truncation at paragraph boundaries

---

## Comparison with Other Qiita MCP Servers

| Feature | This Server | Others |
|---------|------------|--------|
| **Article + Comments Together** | ✅ Parallel fetch | ❌ Article only |
| **Auto Quality Filtering** | ✅ Stock threshold | ❌ None |
| **Auto Trend Calculation** | ✅ One-click | ❌ Manual query |
| **HTML Cleanup** | ✅ cheerio | ❌ None |
| **Japanese Error Messages** | ✅ Full support | ⚠️ English only |
| **Type Safety** | ✅ TypeScript + Zod | ⚠️ Partial |

---

## Usage

Just talk to Claude naturally:

💬 **"Show me TypeScript trends on Qiita"**
→ `get_tech_trends` automatically collects weekly trends

💬 **"Search for React hooks articles"**
→ `search_articles` filters high-quality articles only

💬 **"Summarize this Qiita article: https://qiita.com/.../items/abc123"**
→ `read_article_smart` fetches article + valuable comments at once

---

<details>
<summary>🖥️ For Claude Code CLI</summary>

### Config File

Edit `~/.claude.json`:

```json
{
  "mcpServers": {
    "qiita-researcher": {
      "command": "npx",
      "args": ["-y", "mcp-server-qiita-researcher"],
      "env": {
        "QIITA_ACCESS_TOKEN": ""
      }
    }
  }
}
```

### Launch

```bash
claude
```

Try in Claude:
```
Show me React trends on Qiita
```

✅ Three tools (`search_articles`, `get_tech_trends`, `read_article_smart`) are now available

</details>

---

<details>
<summary>🔧 Developer Setup (Build from Source)</summary>

For developers who want to modify the code:

### Clone and Build

```bash
git clone https://github.com/yourusername/mcp-server-qiita-researcher.git
cd mcp-server-qiita-researcher
npm install
npm run build
```

### Config File

Use `node` instead of `npx`:

```json
{
  "mcpServers": {
    "qiita-researcher": {
      "command": "node",
      "args": ["/absolute/path/mcp-server-qiita-researcher/build/index.js"],
      "env": {
        "QIITA_ACCESS_TOKEN": ""
      }
    }
  }
}
```

**Get absolute path:**
```bash
cd mcp-server-qiita-researcher
pwd
```

### Development Commands

```bash
npm run dev    # Watch mode (auto-rebuild on changes)
npm run build  # Build
npm start      # Verify startup
```

### Project Structure

```
src/
├── index.ts              # MCP server entry point
├── qiitaClient.ts        # Qiita API client
├── types.ts              # Zod schemas + TypeScript types
├── constants.ts          # Configuration
└── utils/
    ├── dateUtils.ts      # Date calculations
    ├── queryBuilder.ts   # Query construction
    ├── htmlCleaner.ts    # HTML cleanup (cheerio)
    └── textTruncator.ts  # Smart truncation
```

</details>

---

<details>
<summary>📚 API Reference</summary>

## `search_articles` - Quality-Focused Search

```json
{
  "query": "React hooks",           // Search keywords
  "sort": "stock",                  // "rel" (relevance) | "stock" (stock count)
  "threshold_stocks": 20            // Minimum stock count (default: 10)
}
```

**What it does:**
- Auto-filters low-quality articles
- Returns clean, token-efficient summaries

---

## `get_tech_trends` - Trend Discovery

```json
{
  "scope": "weekly",                // "weekly" | "monthly" | "new_arrival"
  "topic": "React"                  // Optional: filter by tag
}
```

**What it does:**
- Automatically calculates date ranges
- Applies appropriate stock thresholds
- Returns trending articles without complex query syntax

---

## `read_article_smart` ⭐ - Article + Comments Together

```json
{
  "item_id": "abc123def456"         // Article ID from URL
}
```

**Killer feature:**
- Fetches article body + TOP 3 comments (by reactions) in parallel
- Provides community insights beyond the article alone
- Smart truncation if content exceeds 20,000 characters

**What You Get:**
- Article metadata (title, author, created date, stocks, likes, tags)
- Cleaned article body (HTML removed)
- Top 3 comments sorted by reaction count

</details>

---

<details>
<summary>🔍 Troubleshooting</summary>

## Tools Not Recognized

### npx version

```bash
# Test execution
npx -y mcp-server-qiita-researcher

# Clear cache
npm cache clean --force
```

Expected output:
```
Qiita Researcher MCP Server started successfully
Version: 1.0.0
```

### Source code version

```bash
# Verify build
npm run build
ls build/index.js

# Check path
pwd  # This output should match the path in your config file
```

→ **Fully restart Claude** (close all windows)

---

## Common Errors

### "Qiita APIのレート制限に達しました"

**Cause:** Hit request limit

**Solution:**
1. Wait for the time shown in the error message
2. Add a Qiita access token (60 → 1000 requests/hour)

### "指定された記事が見つかりませんでした"

**Cause:** Incorrect article ID or article is private/deleted

**Solution:**
- Verify article ID from URL
- Check if article is public

---

## Error Handling

The server provides actionable error messages in Japanese:

- **429 (Rate Limit):** Specific retry time extracted from `Retry-After` header
- **404 (Not Found):** Clear "article not found" message
- **401 (Unauthorized):** Invalid access token notification
- **Network Errors:** Connection failure details

</details>

---

## Features

- **Three Intelligent Tools**
  - `search_articles` - Quality-focused article search
  - `get_tech_trends` - One-shot trend gathering
  - `read_article_smart` - Article + comments in one call

- **Token Efficiency**
  - HTML cleanup using cheerio
  - Smart text truncation (20,000 char limit)
  - Removes noise, keeps signal

- **Robust Error Handling**
  - Rate limit detection (429) with specific retry times
  - Actionable error messages in Japanese
  - Graceful degradation

- **Type Safety**
  - Full TypeScript implementation
  - Zod schemas for runtime validation
  - Comprehensive error types

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
