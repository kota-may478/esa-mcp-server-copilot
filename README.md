# esa-mcp-server-copilot

> English version is first. 日本語版は後半にあります。

---

## 🇬🇧 English

Production-ready Model Context Protocol (MCP) server for managing **esa.io** posts directly from GitHub Copilot in VS Code.

### What You Can Do

| Tool Name | Description | Required Parameters |
| :--- | :--- | :--- |
| `esa_create_post` | Create a new post in your esa.io team. | `name`, `body_md` |
| `esa_update_post` | Update an existing post by its number. | `post_number`, and at least one other field |
| `esa_delete_post` | Safely delete a post. | `post_number`, `confirm` (must be true) |
| `esa_get_post` | Retrieve the full content of a specific post. | `post_number` |
| `esa_list_posts` | Search and list posts based on queries. | None (Optional: `q`, `page`, `per_page`) |
| `esa_get_members` | List the members of your esa team. | None |

### Architecture

```text
esa-mcp-server-copilot/
├── src/
│   ├── esa/             # esa.io API Client & Types
│   ├── mcp/             # MCP Tool Handlers & Validators (zod)
│   ├── config.ts        # Environment & Configuration variables
│   ├── server.ts        # Core MCP Server Setup
│   ├── stdio.ts         # Stdio Transport Entry Point
│   └── http.ts          # HTTP Transport Entry Point
├── test/                # Unit Tests (Vitest)
├── .vscode/
│   └── mcp.json         # Workspace-level MCP Configuration
├── .env.example         # Environment variables template
└── package.json         # Dependencies and NPM scripts
```

### Step-by-Step Setup

Follow these steps to set up the server and connect it to VS Code GitHub Copilot.

#### Step 1: Prerequisites

Ensure you have the following installed:
- Node.js (v20.11.0 or newer)
- npm
- GitHub Copilot extension for VS Code
- [esa.io Personal Access Token](https://docs.esa.io/posts/102) with `read` and `write` permissions.

#### Step 2: Installation

Clone the repository and install dependencies.

```bash
git clone https://github.com/kota-may478/esa-mcp-server-copilot.git
cd esa-mcp-server-copilot
npm install
```

#### Step 3: Configuration

Create your local environment variables file based on the provided template.

```bash
# Mac/Linux
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local
```

Open `.env.local` and configure your credentials:
- `ESA_ACCESS_TOKEN`: Your generated esa Personal Access Token.
- `ESA_TEAM_NAME`: Your team name (the `xxx` in `xxx.esa.io`).

#### Step 4: Build

Build the project to generate the executable files in the `dist` folder.

```bash
npm run build
```

#### Step 5: Connect to GitHub Copilot

**Option A: For this specific workspace (Recommended for testing)**
1. Open this project folder in VS Code.
2. The included `.vscode/mcp.json` automatically registers the server for this workspace.
3. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and type `MCP: List Servers`.
4. Find `esaCopilot` in the list and click **Start**.

**Option B: Global User Configuration (Use from any workspace)**
1. Note the absolute path to this folder (e.g., `C:/absolute/path/to/esa-mcp-server-copilot`).
2. Open the Command Palette and select `MCP: Open User Configuration`.
3. Add the following entry to your `servers` object:

```json
{
  "servers": {
    "esaCopilotGlobal": {
      "type": "stdio",
      "command": "node",
      "args": [
        "C:/absolute/path/to/esa-mcp-server-copilot/dist/stdio.js"
      ],
      "cwd": "C:/absolute/path/to/esa-mcp-server-copilot",
      "envFile": "C:/absolute/path/to/esa-mcp-server-copilot/.env.local"
    }
  }
}
```
4. Restart VS Code, run `MCP: List Servers`, and start `esaCopilotGlobal`.

#### Step 6: Configure Copilot Instructions (Optional but highly recommended)

To ensure Copilot adheres perfectly to your workflow rules:
1. Copy the instructions from your `.copilot/instructions` or `.github/copilot-instructions.md`.
2. Apply the rule via VS Code settings (`Chat: Configure Instructions`). This allows Copilot to safely chunk large reads/writes and follow naming conventions automatically.

### Usage in Copilot Chat

Once the server is running, you can open Copilot Chat and ask things like:
- *"List the 5 most recently updated esa posts."*
- *"Get the contents of esa post 123, then format it into a table."*
- *"Create a new WIP post in `Project/Backend` titled 'API Specs'."*

---

## 🇯🇵 日本語

VS Code の GitHub Copilot から直接 **esa.io** の記事を管理するための、本番利用可能な Model Context Protocol (MCP) サーバーです。

### できること (What You Can Do)

| ツール名 | 説明 | 必須パラメーター |
| :--- | :--- | :--- |
| `esa_create_post` | esa に新しい記事を作成します。 | `name`, `body_md` |
| `esa_update_post` | 記事番号を指定して既存の記事を更新します。 | `post_number`, その他更新したい項目 |
| `esa_delete_post` | 記事を安全に削除します。誤操作防止の仕組みがあります。 | `post_number`, `confirm` (true必須) |
| `esa_get_post` | 指定した記事の全文を取得します。 | `post_number` |
| `esa_list_posts` | クエリに基づいて記事を検索・一覧表示します。 | なし (任意: `q`, `page`, `per_page`) |
| `esa_get_members` | チームのメンバー一覧を取得します。 | なし |

### アーキテクチャ (Architecture)

```text
esa-mcp-server-copilot/
├── src/
│   ├── esa/             # esa.io API クライアントと型定義
│   ├── mcp/             # MCP ツールハンドラーとバリデータ (zod)
│   ├── config.ts        # 環境変数と設定管理
│   ├── server.ts        # MCP サーバーのコアセットアップ
│   ├── stdio.ts         # Stdio トランスポートのエントリポイント
│   └── http.ts          # HTTP トランスポートのエントリポイント
├── test/                # 単体テスト (Vitest)
├── .vscode/
│   └── mcp.json         # ワークスペースごとの MCP 設定
├── .env.example         # 環境変数のテンプレート
└── package.json         # 依存パッケージや NPM スクリプト
```

### セットアップ手順 (Step-by-Step Setup)

サーバーを構築し、VS Code の GitHub Copilot に接続する手順です。

#### Step 1: 前提条件

以下の環境が整っていることを確認してください。
- Node.js (v20.11.0 以上)
- npm
- VS Code の GitHub Copilot 拡張機能
- [esa.io Personal Access Token](https://docs.esa.io/posts/102) (権限: `read` および `write`)

#### Step 2: インストール

リポジトリをクローンし、依存パッケージをインストールします。

```bash
git clone https://github.com/kota-may478/esa-mcp-server-copilot.git
cd esa-mcp-server-copilot
npm install
```

#### Step 3: 環境変数の設定

テンプレートをコピーして、ローカル用の環境変数ファイルを作成します。

```bash
# Mac/Linux の場合
cp .env.example .env.local

# Windows PowerShell の場合
Copy-Item .env.example .env.local
```

`.env.local` をエディターで開き、認証情報を入力します。

- `ESA_ACCESS_TOKEN`: 取得した esa の Personal Access Token
- `ESA_TEAM_NAME`: esa のチーム名 (`xxx.esa.io` の `xxx` の部分)

#### Step 4: ビルド

プロジェクトをビルドし、`dist` フォルダに実行ファイルを生成します。

```bash
npm run build
```

#### Step 5: GitHub Copilot への接続

**方法 A: このワークスペースのみで使う場合（テストに推奨）**

1. このフォルダを VS Code で開きます。
2. 同梱されている `.vscode/mcp.json` により、サーバーが自動的に認識されます。
3. コマンドパレット (`Ctrl+Shift+P` または `Cmd+Shift+P`) を開き、`MCP: List Servers` と入力して実行します。
4. 一覧から `esaCopilot` を探し、**Start** をクリックします。

**方法 B: グローバル設定（どのワークスペースからでも使う場合）**

1. このレポジトリまでの絶対パスをメモします（例: `C:/absolute/path/to/esa-mcp-server-copilot`）。
2. コマンドパレットから `MCP: Open User Configuration` を実行します。
3. `servers` に以下の設定を追記します（パスはご自身の環境に合わせて変更してください）。

```json
{
  "servers": {
    "esaCopilotGlobal": {
      "type": "stdio",
      "command": "node",
      "args": [
        "C:/absolute/path/to/esa-mcp-server-copilot/dist/stdio.js"
      ],
      "cwd": "C:/absolute/path/to/esa-mcp-server-copilot",
      "envFile": "C:/absolute/path/to/esa-mcp-server-copilot/.env.local"
    }
  }
}
```
4. VS Code を再起動し、`MCP: List Servers` から `esaCopilotGlobal` を起動します。

#### Step 6: Copilot Instructions の設定 (推奨)

Copilot に安全で正確な esa 記事操作を行わせるため、ルールファイルを設定します。
1. プロジェクトに応じた指示(`.copilot/instructions/esa-workflow.instructions.md` など) を用意します。
2. VS Code の設定(`Chat: Configure Instructions`) でルールを適用します。これにより、長い記事の分割処理や、命名規則への準拠を自動化できます。

### Copilot Chat での利用例

サーバー起動後、Copilot Chat で以下のように話しかけてみてください。
- 「esa の最新記事を 5 件リストアップして。」
- 「esa の記事番号 123 の内容を取得して、要約してください。」
- 「『Project/Backend』カテゴリに『API仕様書』というタイトルで新しい記事を作って (WIPで)。」
