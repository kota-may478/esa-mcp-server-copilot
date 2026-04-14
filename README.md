# esa-mcp-server-copilot

> English version is first. 日本語版は後半にあります。

## English

Production-ready MCP server for managing esa.io posts from GitHub Copilot (VS Code).
It provides safe, validated tools for post creation, updates, listing, fetching, deletion, and member lookup.

### Why this project is Copilot-oriented

- Designed for VS Code + GitHub Copilot Agent workflows
- Local stdio transport is first-class and ready for daily use
- Optional HTTP mode is also available when needed
- Includes practical MCP configuration samples for workspace and user scope
- Human-readable tool responses that Copilot can summarize well

### Implemented MCP tools (exact names)

- `esa_create_post`
- `esa_delete_post`
- `esa_get_members`
- `esa_get_post`
- `esa_list_posts`
- `esa_update_post`

### Safety and quality

- Strong runtime validation with zod
- Defensive error handling with structured responses
- `esa_delete_post` requires explicit `confirm=true`
- Type-safe codebase (TypeScript)
- Logging via pino (stderr)
- Lint, test, and build scripts included

### Prerequisites

- Node.js 20.11.0+
- npm
- esa Personal Access Token (read/write)

### Environment variables

Copy `.env.example` to `.env.local` and fill in values.
The server loads `.env.local` first and then `.env` as a fallback at startup (via `dotenv`), so manual `export` is not required when using npm scripts.

If you already have an existing `.env`, you can keep using it temporarily (fallback is enabled), but `.env.local` is the recommended file going forward.

| Name | Required | Default | Description |
|---|---|---|---|
| `ESA_ACCESS_TOKEN` | Yes | - | esa Personal Access Token |
| `ESA_TEAM_NAME` | Yes | - | `xxx` in `xxx.esa.io` |
| `ESA_API_BASE_URL` | No | `https://api.esa.io/v1` | esa API base URL |
| `ESA_HTTP_TIMEOUT_MS` | No | `15000` | API timeout in ms |
| `LOG_LEVEL` | No | `info` | `trace/debug/info/warn/error/fatal` |
| `MCP_HTTP_HOST` | HTTP only | `127.0.0.1` | HTTP bind host |
| `MCP_HTTP_PORT` | HTTP only | `8787` | HTTP port |
| `MCP_AUTH_TOKEN` | HTTP only | - | HTTP auth token (16+ chars) |

### Local setup (stdio recommended)

1. Install dependencies

```bash
npm install
```

2. Create environment file

```bash
cp .env.example .env.local
```

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

3. Edit `.env.local` and set `ESA_ACCESS_TOKEN`, `ESA_TEAM_NAME`
4. Build

```bash
npm run build
```

5. Start server (production build)

```bash
npm run start
```

### Connect to GitHub Copilot

Use `.vscode/mcp.json` (workspace-shared) included in this repository.

1. Open this folder in VS Code
2. Run `npm run build`
3. Run command: `MCP: List Servers`
4. Start `esaCopilot`

You can also use user-level config via `MCP: Open User Configuration`.

If you want to start this server while working in other directories/workspaces, define a global user server entry and reference this repository via an environment variable.

#### Global user MCP server (works from any workspace)

1. Set environment variable `ESA_MCP_ROOT` to this repository path.

PowerShell (user environment variable):

```powershell
[Environment]::SetEnvironmentVariable("ESA_MCP_ROOT", "C:/absolute/path/to/esa-mcp-server-copilot", "User")
```

2. Open `MCP: Open User Configuration` and add this server.

```json
{
  "servers": {
    "esaCopilotGlobal": {
      "type": "stdio",
      "command": "node",
      "args": [
        "${env:ESA_MCP_ROOT}/dist/stdio.js"
      ],
      "cwd": "${env:ESA_MCP_ROOT}",
      "envFile": "${env:ESA_MCP_ROOT}/.env.local"
    }
  }
}
```

3. Restart VS Code and start `esaCopilotGlobal` from `MCP: List Servers`.

Notes:

- Use a unique user-level name such as `esaCopilotGlobal` to avoid conflicts with workspace server names.
- Keep `.vscode/mcp.json` for repository-local usage and use the global server when working outside this repository.

### Configure Copilot instruction files (global and workspace)

Use this when you want Copilot to apply your esa workflow rules consistently.

#### 1) User-level instructions (recommended for all workspaces)

Create a user profile instructions file:

- Path (Windows): `C:/Users/<YOUR_USER>/.copilot/instructions/esa-workflow.instructions.md`
- Path (macOS/Linux): `~/.copilot/instructions/esa-workflow.instructions.md`

Example:

```markdown
---
name: ESA Workflow Global Rules
description: Use when handling esa posts (read, list, create, update, naming, category placement).
applyTo: "**"
---

# ESA Workflow Rules
- Split large read/write operations into chunks when needed.
- Before create/update, read post #1 (README) and follow the rule.
```

Notes:

- `applyTo: "**"` means pattern-based auto-attachment for all files.
- If you omit `applyTo`, instructions are still discoverable by `description` matching, but not always auto-attached.

#### 2) Workspace-level instructions (recommended for team sharing)

Store shared project rules in one of these files:

- `.github/copilot-instructions.md` (always-on for this repository)
- `.github/instructions/*.instructions.md` (file-based or task-based rules)

Use workspace-level files for team conventions that should travel with git.

#### 3) How to verify applyTo and active status

1. Open command palette and run `Chat: Configure Instructions & Rules` (or `Chat: Configure Instructions` on some versions).
2. Confirm your rule (for example, `ESA Workflow Global Rules`) appears in the list.
3. Open the file and verify frontmatter includes `applyTo: "**"`.
4. If behavior seems stale, run `Developer: Reload Window`.

Optional diagnostics:

- Check chat customization diagnostics to see loaded instructions and errors.
- Ensure these settings are enabled if you customized them:
  - `chat.includeApplyingInstructions`
  - `chat.instructionsFilesLocations`

#### 4) Enable Settings Sync (for multiple devices)

1. Click the account icon in VS Code.
2. Select `Turn on Settings Sync`.
3. Sign in (GitHub or Microsoft account).
4. In sync items, enable `Prompts and Instructions`.

After this, your user-level Copilot instruction files can be synchronized across devices.

### Verify tools are callable

Ask Copilot:

- "List 5 latest esa posts"
- "Get post number 123"
- "Create a WIP post in category Project/Weekly"

### How teammates run locally (step by step)

1. Clone repository

```bash
git clone https://github.com/<YOUR_ORG_OR_USER>/<YOUR_REPO>.git
cd <YOUR_REPO>
```

2. Install dependencies

```bash
npm install
```

3. Create `.env.local` from template and set values

```bash
cp .env.example .env.local
```

4. Build and run

```bash
npm run build
npm run start
```

5. Open VS Code and verify MCP server is running via `MCP: List Servers`.

---

## 日本語

GitHub Copilot 向けに最適化した、esa.io 操作用 MCP サーバーです。  
Copilot Agent から esa 記事の作成・更新・削除・検索・取得・メンバー取得を直接実行できます。

## このプロジェクトの狙い

この実装は、Claude 前提のセットアップや説明を排除し、**GitHub Copilot (VS Code) の MCP ワークフロー**に合わせて設計しています。

- MCP ツール定義は Copilot で使いやすい説明・入力スキーマに調整
- ローカル `stdio` モードを第一級にサポート
- 必要に応じて `http` モードも利用可能
- 入力検証・エラーハンドリング・削除安全策を実装
- チーム共有しやすい `.vscode/mcp.json` と汎用 `.mcp.json` を同梱

## 実装済み MCP ツール

以下のツール名を**厳密に**実装しています。

- `esa_create_post`
- `esa_delete_post`
- `esa_get_members`
- `esa_get_post`
- `esa_list_posts`
- `esa_update_post`

## 主な機能

- TypeScript による厳密型実装
- zod を使った強い入力検証
- `esa_delete_post` で `confirm=true` を必須化
- pino による運用ログ出力（stderr）
- stdio / HTTP のトランスポート分離
- テスト（Vitest）で主要バリデーションを検証

## ディレクトリ構成

```text
esa-mcp-server-copilot/
├─ .env.example
├─ .eslintrc.cjs
├─ .gitignore
├─ .mcp.json
├─ .prettierrc.json
├─ .vscode/
│  └─ mcp.json
├─ package.json
├─ README.md
├─ tsconfig.json
├─ vitest.config.ts
├─ src/
│  ├─ config.ts
│  ├─ errors.ts
│  ├─ http.ts
│  ├─ logger.ts
│  ├─ server.ts
│  ├─ stdio.ts
│  ├─ esa/
│  │  ├─ client.ts
│  │  └─ types.ts
│  └─ mcp/
│     ├─ handlers.ts
│     ├─ toolDefinitions.ts
│     └─ validators.ts
└─ test/
   └─ validators.test.ts
```

## 前提条件

- Node.js 20.11.0 以上
- npm
- esa Personal Access Token（read/write）

## 環境変数

`.env.example` を `.env.local` としてコピーして利用します。
このサーバーは起動時に `dotenv` で `.env.local` を優先し、未設定キーのみ `.env` をフォールバック読み込みするため、npm scripts を使う場合は手動で `export` する必要はありません。

既存の `.env` がある場合も当面はフォールバックで動作しますが、今後の推奨運用は `.env.local` です。

| 変数名 | 必須 | デフォルト | 説明 |
|---|---|---|---|
| `ESA_ACCESS_TOKEN` | 必須 | - | esa の Personal Access Token |
| `ESA_TEAM_NAME` | 必須 | - | `xxx.esa.io` の `xxx` |
| `ESA_API_BASE_URL` | 任意 | `https://api.esa.io/v1` | esa API ベース URL |
| `ESA_HTTP_TIMEOUT_MS` | 任意 | `15000` | API タイムアウト(ms) |
| `LOG_LEVEL` | 任意 | `info` | `trace/debug/info/warn/error/fatal` |
| `MCP_HTTP_HOST` | HTTP時必須 | `127.0.0.1` | HTTP サーバー bind ホスト |
| `MCP_HTTP_PORT` | HTTP時必須 | `8787` | HTTP サーバーポート |
| `MCP_AUTH_TOKEN` | HTTP時必須 | - | HTTP モード認証トークン（16文字以上） |

## ローカルセットアップ

1. 依存関係をインストール

```bash
npm install
```

2. 環境変数ファイルを作成

```bash
cp .env.example .env.local
```

Windows PowerShell の場合:

```powershell
Copy-Item .env.example .env.local
```

3. `.env.local` を編集して `ESA_ACCESS_TOKEN` と `ESA_TEAM_NAME` を設定

4. ビルド

```bash
npm run build
```

## 起動方法

### 1) stdio モード（Copilot 推奨）

開発起動:

```bash
npm run dev
```

本番ビルド後:

```bash
npm run start
```

### 2) HTTP モード（必要時）

`.env.local` に `MCP_AUTH_TOKEN` を設定してください。

開発起動:

```bash
npm run dev:http
```

本番ビルド後:

```bash
npm run start:http
```

ヘルスチェック:

```bash
curl http://127.0.0.1:8787/health
```

## GitHub Copilot への接続

### A. ワークスペース共有設定（推奨）

このリポジトリには ` .vscode/mcp.json` を同梱しています。  
VS Code でこのフォルダをワークスペースとして開き、以下を実行します。

1. `npm run build`
2. コマンドパレットで `MCP: List Servers`
3. `esaCopilot` を Start

> 初回起動時は trust 確認ダイアログが表示される場合があります。

### B. 汎用設定ファイル

`.mcp.json` も同梱しています。利用する環境やツールに合わせて参照してください。

### C. ユーザーレベル設定（全ワークスペース共通）

別のディレクトリを開いている時にも `esaCopilot` を使いたい場合は、User Configuration をグローバル用途で設定します。

まず、`ESA_MCP_ROOT` にこのリポジトリの絶対パスを設定します。

PowerShell（ユーザー環境変数）:

```powershell
[Environment]::SetEnvironmentVariable("ESA_MCP_ROOT", "C:/absolute/path/to/esa-mcp-server-copilot", "User")
```

その後、コマンドパレットで `MCP: Open User Configuration` を実行し、以下を追加します。

```json
{
  "servers": {
    "esaCopilotGlobal": {
      "type": "stdio",
      "command": "node",
      "args": [
        "${env:ESA_MCP_ROOT}/dist/stdio.js"
      ],
      "cwd": "${env:ESA_MCP_ROOT}",
      "envFile": "${env:ESA_MCP_ROOT}/.env.local"
    }
  }
}
```

補足:

- User 側サーバー名は `esaCopilotGlobal` のように一意名を推奨します（ワークスペース側 `esaCopilot` と重複回避）。
- 設定後は VS Code を再起動し、`MCP: List Servers` から `esaCopilotGlobal` を起動してください。

### D. Copilot 向け instructions ファイル設定（全ワークスペース共通・詳細）

esa 運用ルールをどのワークスペースでも安定して効かせるには、ユーザーレベル instructions を使います。

#### 1) ユーザーレベル instructions の作成（推奨）

次の場所にファイルを作成します。

- Windows: `C:/Users/<YOUR_USER>/.copilot/instructions/esa-workflow.instructions.md`
- macOS/Linux: `~/.copilot/instructions/esa-workflow.instructions.md`

例:

```markdown
---
name: ESA Workflow Global Rules
description: Use when handling esa posts (read, list, create, update, naming, category placement).
applyTo: "**"
---

# ESA Workflow Rules
- 大きな記事の読込/更新は分割して処理する。
- 作成/更新前に post #1 README の「記事作成のルール」を参照する。
```

補足:

- `applyTo: "**"` はパターン適用による自動アタッチを広く有効化します。
- `applyTo` を省略すると、`description` 一致時には使われますが、常時自動ではありません。

#### 2) ワークスペース共有 rules（チーム向け）

チームで共有したい場合は、リポジトリにも置きます。

- `.github/copilot-instructions.md`（このリポジトリで常時適用）
- `.github/instructions/*.instructions.md`（ファイル種別/タスク別）

ユーザー固有ルールは `~/.copilot/instructions`、チーム共通ルールは `.github/` 配下、という分離が運用しやすいです。

#### 3) applyTo 設定と有効状態の確認方法

1. コマンドパレットで `Chat: Configure Instructions & Rules`（環境によっては `Chat: Configure Instructions`）を実行
2. `ESA Workflow Global Rules` が一覧に見えることを確認
3. ファイル先頭 frontmatter に `applyTo: "**"` があることを確認
4. 反映が不安定な場合は `Developer: Reload Window` を実行

必要に応じて、Chat customization diagnostics で読み込まれた instructions とエラーを確認してください。
また、設定を変更している場合は次が有効か確認します。

- `chat.includeApplyingInstructions`
- `chat.instructionsFilesLocations`

#### 4) Settings Sync の有効化（別端末へ同期）

1. VS Code 左下のアカウントアイコンをクリック
2. `Turn on Settings Sync` を選択
3. GitHub または Microsoft アカウントでサインイン
4. 同期項目で `Prompts and Instructions` を有効化

これでユーザーレベル instructions を複数端末で共有できます。

### E. HTTP サーバーとして登録する場合

`npm run start:http` でサーバーを起動したうえで、次の設定を追加します。

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "esa-http-token",
      "description": "MCP_AUTH_TOKEN",
      "password": true
    }
  ],
  "servers": {
    "esaCopilotHttp": {
      "type": "http",
      "url": "http://127.0.0.1:8787/mcp?token=${input:esa-http-token}"
    }
  }
}
```

## ツールが見えることの確認手順

1. コマンドパレットで `MCP: List Servers`
2. `esaCopilot` が `Running` になっていることを確認
3. Copilot Chat/Agent で次のように依頼

- 「esa の最新5件を取得して」
- 「記事番号123を取得して要約して」
- 「タイトル『週次報告』で記事を作成して（WIP）」

## 使い方の例（自然文）

- 「`Project/Backend` カテゴリで、タイトル `API 仕様メモ` の記事を作成して。本文は次の通り ...」
- 「記事番号 `245` の本文を更新して。タグは `api` と `design` にして」
- 「`#meeting` タグの記事を10件検索して」
- 「記事番号 `300` を削除して。confirm は true。理由は重複作成」

## 他メンバーがローカル運用する手順（Step by Step）

1. リポジトリを clone

```bash
git clone https://github.com/<YOUR_ORG_OR_USER>/<YOUR_REPO>.git
cd <YOUR_REPO>
```

2. 依存関係をインストール

```bash
npm install
```

3. `.env.local` を作成して値を設定

```bash
cp .env.example .env.local
```

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

4. ビルドして起動

```bash
npm run build
npm run start
```

5. VS Code の `MCP: List Servers` で `esaCopilot` を起動し、ツールが見えることを確認します。

## 品質確認コマンド

```bash
npm run lint
npm run test
npm run build
```

## トラブルシューティング

### サーバーが起動しない

- `node -v` が 20.11.0 以上か確認
- `.env.local` に `ESA_ACCESS_TOKEN` / `ESA_TEAM_NAME` があるか確認
- `npm run build` 後に `dist/stdio.js` が生成されているか確認

### ツールが表示されない

- `MCP: List Servers` で停止中なら Start
- `MCP: Reset Cached Tools` を実行
- `mcp.json` の `args` / `cwd` のパス誤りを確認

### esa API エラー

- トークン権限（read/write）を確認
- `ESA_TEAM_NAME` が正しいか確認
- 失敗時レスポンスはツール結果の `details` に出力されます

### HTTP モードが 401 になる

- `MCP_AUTH_TOKEN` と `?token=` の値を一致させる
- または `Authorization: Bearer <token>` を使用

## セキュリティ注意事項

- `.env.local` は git 管理しない（本リポジトリは `.gitignore` 済み）
- トークンを README や `mcp.json` に平文固定しない
- MCP 設定は `envFile` で供給し、`env` との二重定義を避ける
- 削除系は `confirm=true` を必須化し、誤操作を低減

## チーム運用メモ

- ` .vscode/mcp.json` を共有してオンボーディングを簡略化
- 本番運用前に `npm run lint && npm run test && npm run build` を CI に追加推奨
- HTTP モードを外部公開する場合は HTTPS・アクセス制限・監査ログを必須化

## 設計上の判断

- **stdio を主軸**: Copilot のローカル MCP 接続で最も簡潔かつ安定するため
- **HTTP を補助提供**: 将来のリモート接続や共有ゲートウェイ化に備えるため
- **共通サーバーファクトリ**: ツールロジックをトランスポートから分離し、保守性を向上
- **入力検証を二重化**: MCP スキーマ + 実行時 zod 検証で防御的に運用

## 制限事項

- esa API 側の仕様変更があった場合は追従が必要
- HTTP モードは認証トークンのみ実装（OAuth や IP 制限は未実装）
- 本実装は記事本文の巨大ペイロード最適化（分割アップロード等）は未対応
