export const ESA_TOOL_DEFINITIONS = [
  {
    name: "esa_list_posts",
    description:
      "esa の記事一覧を取得します。検索クエリ、ページ番号、ページサイズを指定できます。",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        q: {
          type: "string",
          description:
            "検索クエリ。例: category:日報、wip:false、#meeting、updated:>2026-01-01",
        },
        per_page: {
          type: "integer",
          minimum: 1,
          maximum: 100,
          default: 20,
          description: "1ページあたりの件数 (1-100)。",
        },
        page: {
          type: "integer",
          minimum: 1,
          default: 1,
          description: "ページ番号 (1以上)。",
        },
      },
    },
  },
  {
    name: "esa_get_post",
    description: "記事番号を指定して、esa の単一記事を取得します。",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        post_number: {
          type: "integer",
          minimum: 1,
          description: "取得対象の記事番号。",
        },
      },
      required: ["post_number"],
    },
  },
  {
    name: "esa_create_post",
    description: "esa に新規記事を作成します。",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          description: "記事タイトル。",
        },
        body_md: {
          type: "string",
          minLength: 1,
          description: "Markdown 本文。",
        },
        category: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          description: "カテゴリ。例: Project/Design",
        },
        tags: {
          type: "array",
          maxItems: 50,
          items: {
            type: "string",
            minLength: 1,
            maxLength: 50,
          },
          description: "タグ一覧。",
        },
        wip: {
          type: "boolean",
          default: true,
          description: "true なら WIP として作成します。",
        },
        message: {
          type: "string",
          minLength: 1,
          maxLength: 200,
          description: "変更メッセージ。",
        },
      },
      required: ["name", "body_md"],
    },
  },
  {
    name: "esa_update_post",
    description: "既存記事を更新します。post_number 以外に少なくとも1項目の更新が必要です。",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        post_number: {
          type: "integer",
          minimum: 1,
          description: "更新対象の記事番号。",
        },
        name: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          description: "新しいタイトル。",
        },
        body_md: {
          type: "string",
          minLength: 1,
          description: "新しい Markdown 本文。",
        },
        category: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          description: "新しいカテゴリ。",
        },
        tags: {
          type: "array",
          maxItems: 50,
          items: {
            type: "string",
            minLength: 1,
            maxLength: 50,
          },
          description: "新しいタグ一覧。",
        },
        wip: {
          type: "boolean",
          description: "WIP 状態。",
        },
        message: {
          type: "string",
          minLength: 1,
          maxLength: 200,
          description: "変更メッセージ。",
        },
      },
      required: ["post_number"],
    },
  },
  {
    name: "esa_delete_post",
    description:
      "記事を削除します。破壊的操作のため confirm=true を必須にしています。",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        post_number: {
          type: "integer",
          minimum: 1,
          description: "削除対象の記事番号。",
        },
        confirm: {
          type: "boolean",
          const: true,
          description: "安全確認フラグ。必ず true を指定してください。",
        },
        reason: {
          type: "string",
          minLength: 3,
          maxLength: 120,
          description: "削除理由 (監査用の任意情報)。",
        },
      },
      required: ["post_number", "confirm"],
    },
  },
  {
    name: "esa_get_members",
    description: "esa チームメンバーを一覧取得します。",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {},
    },
  },
] as const;
