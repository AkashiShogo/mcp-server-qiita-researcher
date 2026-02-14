# mcp-server-qiita-researcher

**単なるAPIラッパーではなく、リサーチアシスタント。**

[![npm version](https://img.shields.io/npm/v/@akashishogo/mcp-server-qiita-researcher)](https://www.npmjs.com/package/@akashishogo/mcp-server-qiita-researcher)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English README](./README.md)

---

## 🎬 デモ

![Demo Animation](docs/demo.gif)

> Claudeに「Reactのトレンドを教えて」と尋ねるだけで、シュパパパッと高品質な記事+コミュニティの知見が返ってきます

---

## ⚡ 3秒で始める

**Claude Desktopの設定ファイルに、これを貼るだけ：**

```json
{
  "mcpServers": {
    "qiita-researcher": {
      "command": "npx",
      "args": ["-y", "@akashishogo/mcp-server-qiita-researcher"],
      "env": {
        "QIITA_ACCESS_TOKEN": ""
      }
    }
  }
}
```

**Claude Desktopを再起動** → 完了🎉

<details>
<summary>📁 設定ファイルの場所を確認する</summary>

**Claude Desktop:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

ファイルが存在しない場合は新規作成してください。

</details>

<details>
<summary>🔑 Qiitaアクセストークンを設定する（オプションだが推奨）</summary>

**トークンなし:** 60リクエスト/時
**トークンあり:** 1000リクエスト/時

1. [Qiitaトークン設定](https://qiita.com/settings/tokens/new)にアクセス
2. 読み取り権限で新しいトークンを作成
3. トークンを上記の`QIITA_ACCESS_TOKEN`に貼り付け

</details>

---

## なぜこのMCPサーバー？

ほとんどのQiita MCPサーバーは、Qiita APIの薄いラッパーに過ぎません。
**mcp-server-qiita-researcher**は、3つの革新的な機能で差別化を図っています。

### 🎯 スマートリーディング：記事+有益なコメント

**キラー機能** - 記事だけでなく、最も価値のあるコメント（リアクション数順TOP3）を1回の呼び出しで取得

- 並列API呼び出しによる高速化
- コミュニティの知見や洞察を自動収集
- トークン効率化のためのHTMLクリーンアップ

### 📈 トレンドスカウト：ワンクリックでトレンド発見

複雑なクエリ構文や日付計算なしで、Qiitaのトレンド記事を発見

- `weekly`：過去7日間、20ストック以上
- `monthly`：過去30日間、50ストック以上
- `new_arrival`：過去2日間、5ストック以上
- オプションでトピック絞り込み

### 🔍 ノイズ削減：品質重視の検索

デフォルトで低品質な記事を自動的に除外（ストック数閾値は設定可能）

- クエリに自動で`stocks:>N`フィルタを追加
- トークン負荷の高いHTML（iframe、画像、スクリプト）を削除
- 段落境界でのスマート切り詰め

---

## 他のQiita MCPサーバーとの比較

| 機能 | 本サーバー | 他 |
|------|-----------|-----|
| **記事+コメント同時取得** | ✅ 並列取得 | ❌ 記事のみ |
| **自動品質フィルタリング** | ✅ ストック閾値 | ❌ なし |
| **トレンド自動計算** | ✅ ワンクリック | ❌ 手動クエリ |
| **HTMLクリーンアップ** | ✅ cheerio | ❌ なし |
| **日本語エラーメッセージ** | ✅ 完全対応 | ⚠️ 英語のみ |
| **型安全性** | ✅ TypeScript + Zod | ⚠️ 部分的 |

---

## 使い方

Claudeに自然に話しかけるだけ：

💬 **「Qiitaで『TypeScript』のトレンド記事を教えて」**
→ `get_tech_trends` で週間トレンドを自動収集

💬 **「『React hooks』について検索して」**
→ `search_articles` で高品質記事のみをフィルタリング

💬 **「このQiita記事を要約して: https://qiita.com/.../items/abc123」**
→ `read_article_smart` で記事+有益なコメントを一括取得

---

<details>
<summary>🖥️ Claude Code CLIで使う場合</summary>

### 設定ファイル

`~/.claude.json` を編集：

```json
{
  "mcpServers": {
    "qiita-researcher": {
      "command": "npx",
      "args": ["-y", "@akashishogo/mcp-server-qiita-researcher"],
      "env": {
        "QIITA_ACCESS_TOKEN": ""
      }
    }
  }
}
```

### 起動

```bash
claude
```

Claudeで試してみる：
```
Qiitaで「React」のトレンドを教えて
```

✅ 3つのツール（`search_articles`、`get_tech_trends`、`read_article_smart`）が使えるようになります

</details>

---

<details>
<summary>🔧 開発者向けセットアップ（ソースコードからビルド）</summary>

コードを修正・カスタマイズしたい場合：

### クローンとビルド

```bash
git clone https://github.com/yourusername/mcp-server-qiita-researcher.git
cd mcp-server-qiita-researcher
npm install
npm run build
```

### 設定ファイル

`npx`の代わりに`node`を使用：

```json
{
  "mcpServers": {
    "qiita-researcher": {
      "command": "node",
      "args": ["/絶対パス/mcp-server-qiita-researcher/build/index.js"],
      "env": {
        "QIITA_ACCESS_TOKEN": ""
      }
    }
  }
}
```

**絶対パスの確認:**
```bash
cd mcp-server-qiita-researcher
pwd
```

### 開発コマンド

```bash
npm run dev    # ウォッチモード（変更を自動検知）
npm run build  # ビルド
npm start      # 起動確認
```

### プロジェクト構造

```
src/
├── index.ts              # MCPサーバーエントリーポイント
├── qiitaClient.ts        # Qiita APIクライアント
├── types.ts              # Zodスキーマ + TypeScript型
├── constants.ts          # 設定
└── utils/
    ├── dateUtils.ts      # 日付計算
    ├── queryBuilder.ts   # クエリ構築
    ├── htmlCleaner.ts    # HTMLクリーンアップ（cheerio）
    └── textTruncator.ts  # スマート切り詰め
```

</details>

---

<details>
<summary>📚 API リファレンス</summary>

## `search_articles` - 品質重視の検索

```json
{
  "query": "React hooks",           // 検索キーワード
  "sort": "stock",                  // "rel" (関連度順) | "stock" (ストック数順)
  "threshold_stocks": 20            // 最小ストック数（デフォルト: 10）
}
```

**動作:**
- 低品質記事を自動除外
- トークン効率の良いクリーンなサマリーを返却

---

## `get_tech_trends` - トレンド発見

```json
{
  "scope": "weekly",                // "weekly" | "monthly" | "new_arrival"
  "topic": "React"                  // オプション：タグで絞り込み
}
```

**動作:**
- 日付範囲を自動計算
- 適切なストック閾値を適用
- 複雑なクエリ構文なしでトレンド記事を取得

---

## `read_article_smart` ⭐ - 記事+コメント一括取得

```json
{
  "item_id": "abc123def456"         // URLの末尾ID
}
```

**キラー機能:**
- 記事本文+リアクション数TOP3コメントを並列取得
- 記事だけでは得られないコミュニティの知見を提供
- 20,000文字を超える場合のスマート切り詰め

**取得内容:**
- 記事メタデータ（タイトル、著者、作成日、ストック数、いいね数、タグ）
- クリーンな記事本文（HTML除去済み）
- リアクション数順のトップ3コメント

</details>

---

<details>
<summary>🔍 トラブルシューティング</summary>

## ツールが認識されない

### npx版

```bash
# 動作確認
npx -y @akashishogo/mcp-server-qiita-researcher

# キャッシュクリア
npm cache clean --force
```

期待される出力:
```
Qiita Researcher MCP Server started successfully
Version: 1.0.0
```

### ソースコード版

```bash
# ビルド確認
npm run build
ls build/index.js

# パス確認
pwd  # この出力が設定ファイルのパスと一致するか確認
```

→ **Claudeを完全再起動**（すべてのウィンドウを閉じる）

---

## よくあるエラー

### 「Qiita APIのレート制限に達しました」

**原因:** リクエスト制限に到達

**解決策:**
1. エラーメッセージに表示された時間まで待つ
2. Qiitaアクセストークンを設定（60 → 1000リクエスト/時）

### 「指定された記事が見つかりませんでした」

**原因:** 記事IDが間違っているか、記事が非公開/削除

**解決策:**
- URLから記事IDを確認
- 記事が公開されているか確認

---

## エラーハンドリング

サーバーは実用的な日本語エラーメッセージを提供：

- **429（レート制限）:** `Retry-After`ヘッダーから具体的な再試行時間を提示
- **404（見つからない）:** 「記事が見つかりませんでした」という明確なメッセージ
- **401（認証エラー）:** 無効なアクセストークンの通知
- **ネットワークエラー:** 接続失敗の詳細

</details>

---

## 機能一覧

- **3つのインテリジェントツール**
  - `search_articles` - 品質重視の記事検索
  - `get_tech_trends` - ワンショットトレンド収集
  - `read_article_smart` - 記事+コメントを1回で取得

- **トークン効率**
  - cheerioによるHTMLクリーンアップ
  - スマートなテキスト切り詰め（20,000文字制限）
  - ノイズを削減し、シグナルを維持

- **堅牢なエラーハンドリング**
  - レート制限検出（429）と具体的な再試行時間の提示
  - 日本語での実用的なエラーメッセージ
  - グレースフルデグラデーション

- **型安全性**
  - 完全なTypeScript実装
  - ランタイム検証のためのZodスキーマ
  - 包括的なエラー型定義

---

## ライセンス

MIT License - 詳細は[LICENSE](LICENSE)を参照してください。

---

## コントリビューション

コントリビューションを歓迎します！お気軽にPull Requestを送ってください。

---

## 作者

AKASHI SHOGO

---

## 謝辞

- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)を使用して構築
- [Qiita API v2](https://qiita.com/api/v2/docs)を利用
