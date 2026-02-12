# mcp-server-qiita-researcher

**単なるAPIラッパーではなく、リサーチアシスタント。**

[English README](./README.md)

Qiita専用のインテリジェントなMCP（Model Context Protocol）サーバーです。単純なAPIラッパーを超えて、ClaudeなどのAIアシスタント向けに高度なリサーチ機能を提供します。

## なぜこのMCPサーバー？

ほとんどのQiita MCPサーバーは、Qiita APIの薄いラッパーに過ぎません。**mcp-server-qiita-researcher**は、3つの革新的な機能で差別化を図っています：

### 🎯 1. スマートリーディング：記事+有益なコメント

**キラー機能** - 記事だけでなく、最も価値のあるコメント（リアクション数順）を1回の呼び出しで取得します。記事単体では得られない、コミュニティの知見や洞察を提供します。

- 並列API呼び出しによる高速化
- リアクション数トップ3のコメント取得
- トークン効率化のためのHTMLクリーンアップ

### 📈 2. トレンドスカウト：ワンクリックでトレンド発見

複雑なクエリ構文や日付計算なしで、Qiitaのトレンド記事を発見できます。

- `weekly`：過去7日間、20ストック以上
- `monthly`：過去30日間、50ストック以上
- `new_arrival`：過去2日間、5ストック以上
- オプションでトピック絞り込み

### 🔍 3. ノイズ削減：品質重視の検索

デフォルトで低品質な記事を自動的に除外します（ストック数閾値は設定可能）。

- クエリに自動で`stocks:>N`フィルタを追加
- トークン負荷の高いHTML（iframe、画像、スクリプト）を削除
- 段落境界でのスマートな切り詰め

---

## 機能

- **3つのインテリジェントツール：**
  - `search_articles` - 品質重視の記事検索
  - `get_tech_trends` - ワンショットトレンド収集
  - `read_article_smart` - 記事+コメントを1回で取得

- **トークン効率：**
  - cheerioによるHTMLクリーンアップ
  - スマートなテキスト切り詰め（20,000文字制限）
  - ノイズを削減し、シグナルを維持

- **堅牢なエラーハンドリング：**
  - レート制限検出（429）と具体的な再試行時間の提示
  - 日本語での実用的なエラーメッセージ
  - グレースフルデグラデーション

- **型安全性：**
  - 完全なTypeScript実装
  - ランタイム検証のためのZodスキーマ
  - 包括的なエラー型定義

---

## インストール

### 前提条件

- **Node.js 18以上** - [こちらからダウンロード](https://nodejs.org/)
- **npm**（Node.jsに同梱）または**yarn**
- **Claude Desktop**または**Claude Code CLI**

### ステップ1：クローンとビルド

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/mcp-server-qiita-researcher.git
cd mcp-server-qiita-researcher

# 依存関係をインストール
npm install

# プロジェクトをビルド
npm run build
```

ビルド後、コンパイルされたJavaScriptファイルを含む`build/`ディレクトリが作成されます。

### ステップ2：Qiitaアクセストークンの取得（オプションだが推奨）

トークンなしの場合、**60リクエスト/時**に制限されます。トークンありの場合、**1000リクエスト/時**になります。

1. [Qiitaトークン設定](https://qiita.com/settings/tokens/new)にアクセス
2. 読み取り権限で新しいトークンを作成
3. トークンをコピー（次のステップで使用します）

---

## 設定

環境を選択してください：

### オプションA：Claude Desktop

**macOS/Linux:**

1. 設定ファイルを開く：
   ```bash
   # macOS
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json

   # Linux
   nano ~/.config/Claude/claude_desktop_config.json
   ```

2. サーバー設定を追加：
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

3. **重要：** `/absolute/path/to/mcp-server-qiita-researcher`を実際のパスに置き換えてください。以下のコマンドで取得できます：
   ```bash
   pwd
   ```

4. Claude Desktopを再起動

**Windows:**

1. 以下の場所にある設定ファイルを開く：
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. 同じ設定を追加（パスはフォワードスラッシュを使用）

3. Claude Desktopを再起動

### オプションB：Claude Code CLI

**ステップバイステップ設定：**

1. 現在の作業ディレクトリを確認：
   ```bash
   pwd
   # 出力例: /Users/yourname/projects/mcp-server-qiita-researcher
   ```

2. Claude設定ファイルを編集：
   ```bash
   # 方法1：jqを使用（推奨）
   jq '.mcpServers["qiita-researcher"] = {
     "command": "node",
     "args": ["/absolute/path/to/mcp-server-qiita-researcher/build/index.js"],
     "env": {"QIITA_ACCESS_TOKEN": ""}
   }' ~/.claude.json > ~/.claude.json.tmp && mv ~/.claude.json.tmp ~/.claude.json

   # 方法2：手動編集
   nano ~/.claude.json
   ```

3. 手動で編集する場合、JSONのルートレベルに以下を追加：
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
     "...他の既存設定...": "..."
   }
   ```

4. 設定を確認：
   ```bash
   jq '.mcpServers["qiita-researcher"]' ~/.claude.json
   ```

   設定が表示されるはずです。

5. 新しいClaude Codeセッションを開始：
   ```bash
   # プロジェクトディレクトリ外から起動
   cd ~
   claude
   ```

---

## 使用例

### 例1：TypeScript記事を検索

Claudeに尋ねる：
```
Qiitaで「TypeScript 型推論」に関する記事を検索して
```

Claudeは`search_articles`ツールを使用し、10ストック以上の高品質記事を返します。

### 例2：週間トレンドを取得

Claudeに尋ねる：
```
Qiitaの今週のトレンド記事を教えて
```

Claudeは`get_tech_trends`ツールを`scope: "weekly"`で使用します。

### 例3：記事をコメント付きで読む

Claudeに尋ねる：
```
このQiita記事を詳しく読んで要約して: https://qiita.com/username/items/abc123def456
```

Claudeは記事IDを抽出し、`read_article_smart`を使用して記事+トップ3の有益なコメントを取得します。

---

## ツールリファレンス

### 1. `search_articles`

自動品質フィルタリング付きでQiita記事を検索します。

**パラメータ：**
- `query`（文字列、必須）：検索キーワード
- `sort`（列挙型、オプション）：ソート順
  - `rel`（デフォルト）：関連度順
  - `stock`：ストック数順
- `threshold_stocks`（数値、オプション）：最小ストック数フィルタ（デフォルト：10）

**例：**
```json
{
  "query": "React hooks",
  "sort": "stock",
  "threshold_stocks": 20
}
```

**動作：**
- 低品質記事を除外するため、自動的に`stocks:>N`フィルタを追加
- 関連度またはストック数でソート
- トークン効率の良いクリーンな記事サマリーを返却

---

### 2. `get_tech_trends`

ワンクリックでトレンド記事を取得します。

**パラメータ：**
- `scope`（列挙型、必須）：期間
  - `weekly`：過去7日間、20ストック以上
  - `monthly`：過去30日間、50ストック以上
  - `new_arrival`：過去2日間、5ストック以上
- `topic`（文字列、オプション）：タグで絞り込み（例：「React」「TypeScript」「AI」）

**例：**
```json
{
  "scope": "weekly",
  "topic": "React"
}
```

**動作：**
- 日付範囲を自動計算
- 適切なストック閾値を適用
- 複雑なクエリ構文なしでトレンド記事を返却

---

### 3. `read_article_smart` ⭐ キラー機能

記事と価値あるコメントを1回の呼び出しで取得します。

**パラメータ：**
- `item_id`（文字列、必須）：URLからのQiita記事ID
  - 例：`https://qiita.com/username/items/abc123def456`の場合、`abc123def456`を使用

**例：**
```json
{
  "item_id": "abc123def456"
}
```

**取得内容：**
- 記事メタデータ（タイトル、著者、作成日、ストック数、いいね数、タグ）
- クリーンな記事本文（トークン効率のためHTML除去済み）
- リアクション数順のトップ3コメント
- コミュニティの洞察と追加のヒント
- 20,000文字を超える場合のスマート切り詰め

**強力な理由：**
- 1回のAPI呼び出しで記事+コメントを並列取得
- 価値あるコミュニティフィードバックを自動発見
- 記事のみのツールより豊富なコンテキストを提供

---

## トラブルシューティング

### MCPサーバーが読み込まれない

**症状：**
- ClaudeがQiitaツールを認識しない
- Claudeのツールリストにツールが表示されない

**解決策：**

1. **ビルドを確認：**
   ```bash
   ls build/index.js
   # 出力: build/index.js
   ```

2. **設定パスを確認：**
   ```bash
   # 絶対パスを取得
   cd /path/to/mcp-server-qiita-researcher
   pwd

   # 設定と一致するか確認
   cat ~/.claude.json | jq '.mcpServers["qiita-researcher"].args'
   ```

3. **サーバーを手動テスト：**
   ```bash
   node build/index.js
   # 出力: "Qiita Researcher MCP Server started successfully"
   # Ctrl+Cで停止
   ```

4. **Claudeを完全に再起動：**
   - すべてのClaudeセッションを終了
   - 新しいセッションを開始

5. **デバッグログを確認（Claude Code CLIのみ）：**
   ```bash
   ls -lt ~/.claude/debug/ | head -5
   # 最新のログファイルを確認
   grep -i "qiita" ~/.claude/debug/latest
   ```

### レート制限エラー

**症状：**
- エラー：「Qiita APIのレート制限に達しました」

**解決策：**
1. エラーメッセージに表示された時間だけ待つ
2. 設定にQiitaアクセストークンを追加（制限が60→1000リクエスト/時に増加）

### 記事が見つからない

**症状：**
- エラー：「指定された記事が見つかりませんでした」

**解決策：**
1. 記事IDが正しいか確認
2. 記事が公開されているか確認（非公開または削除されていないか）

---

## 開発

### プロジェクト構造

```
src/
├── index.ts              # MCPサーバーエントリーポイント + ツール登録
├── qiitaClient.ts        # エラーハンドリング付きQiita APIクライアント
├── types.ts              # Zodスキーマ + TypeScript型定義
├── constants.ts          # 設定定数
└── utils/
    ├── dateUtils.ts      # トレンド用の日付計算
    ├── queryBuilder.ts   # クエリ構築ロジック
    ├── htmlCleaner.ts    # CheerioベースのHTMLクリーンアップ
    └── textTruncator.ts  # スマート切り詰め + 記事/コメント結合
```

### 開発コマンド

```bash
# プロジェクトをビルド
npm run build

# ウォッチモード（変更時に再ビルド）
npm run dev

# サーバーを直接起動
npm start
```

### テスト

Claude DesktopまたはClaude Code CLIを使用してサーバーをテスト：

1. **search_articles**：閾値以上のストック数を持つ高品質記事を返すはず
2. **get_tech_trends**：最近のトレンド記事を返すはず
3. **read_article_smart**：記事+トップ3コメントを結合して返すはず

---

## エラーハンドリング

サーバーは実用的なエラーメッセージを提供します：

- **レート制限（429）：** `Retry-After`ヘッダーから抽出した具体的な待機時間
- **見つからない（404）：** 「記事が見つかりませんでした」という明確なメッセージ
- **認証エラー（401）：** 無効なアクセストークン
- **ネットワークエラー：** 接続失敗メッセージ

すべてのエラーメッセージは日本語で表示されます。

---

## 他のQiita MCPサーバーとの比較

| 機能 | mcp-server-qiita-researcher | 他のQiitaサーバー |
|------|----------------------------|------------------|
| 記事+コメントを1回で取得 | ✅ あり（並列） | ❌ なし |
| 自動品質フィルタリング | ✅ あり（ストック閾値） | ❌ なし |
| 日付計算なしのトレンドクエリ | ✅ あり（スコープベース） | ❌ なし |
| トークン用HTMLクリーンアップ | ✅ あり（cheerioベース） | ❌ なし |
| スマートテキスト切り詰め | ✅ あり（段落考慮） | ❌ なし |
| 詳細なエラーメッセージ | ✅ あり（日本語） | ⚠️ 基本的 |

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
