import type { Logger } from "../logger.js";
import { AppError, isAppError } from "../errors.js";
import type { EsaClient } from "../esa/client.js";
import {
  parseCreatePostInput,
  parseDeletePostInput,
  parseGetMembersInput,
  parseGetPostInput,
  parseListPostsInput,
  parseUpdatePostInput,
} from "./validators.js";

interface ToolHandlerDeps {
  client: EsaClient;
  logger: Logger;
}

type ToolResult = {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
};

export async function handleToolCall(
  toolName: string,
  args: unknown,
  deps: ToolHandlerDeps,
): Promise<ToolResult> {
  try {
    switch (toolName) {
      case "esa_list_posts": {
        const input = parseListPostsInput(args);
        const result = await deps.client.listPosts(input);
        return success(
          "esa_list_posts",
          `記事一覧を取得しました。取得件数: ${result.posts.length}件 / 総件数: ${result.total_count}件`,
          result,
        );
      }

      case "esa_get_post": {
        const input = parseGetPostInput(args);
        const result = await deps.client.getPost(input.post_number);
        return success(
          "esa_get_post",
          `記事 #${result.number} を取得しました。タイトル: ${result.full_name}`,
          result,
        );
      }

      case "esa_create_post": {
        const input = parseCreatePostInput(args);
        const result = await deps.client.createPost(input);
        return success(
          "esa_create_post",
          `記事を作成しました。記事番号: #${result.number} / タイトル: ${result.full_name}`,
          result,
        );
      }

      case "esa_update_post": {
        const input = parseUpdatePostInput(args);
        const { post_number, ...payload } = input;
        const result = await deps.client.updatePost(post_number, payload);
        return success(
          "esa_update_post",
          `記事 #${result.number} を更新しました。タイトル: ${result.full_name}`,
          result,
        );
      }

      case "esa_delete_post": {
        const input = parseDeletePostInput(args);
        await deps.client.deletePost(input.post_number);
        return success(
          "esa_delete_post",
          `記事 #${input.post_number} を削除しました。`,
          {
            post_number: input.post_number,
            confirmed: input.confirm,
            reason: input.reason ?? null,
          },
        );
      }

      case "esa_get_members": {
        parseGetMembersInput(args);
        const result = await deps.client.getMembers();
        return success(
          "esa_get_members",
          `メンバー一覧を取得しました。件数: ${result.members.length}件`,
          result,
        );
      }

      default:
        throw new AppError(`未対応のツールです: ${toolName}`, {
          code: "UNKNOWN_TOOL",
        });
    }
  } catch (error) {
    deps.logger.error({ err: error, toolName }, "ツール実行に失敗しました");
    return failure(toolName, error);
  }
}

function success(tool: string, summary: string, data: unknown): ToolResult {
  return {
    content: [
      {
        type: "text",
        text: [
          "status: success",
          `tool: ${tool}`,
          `summary: ${summary}`,
          "data:",
          JSON.stringify(data, null, 2),
        ].join("\n"),
      },
    ],
  };
}

function failure(tool: string, error: unknown): ToolResult {
  const detail = formatError(error);

  return {
    isError: true,
    content: [
      {
        type: "text",
        text: [
          "status: error",
          `tool: ${tool}`,
          `message: ${detail.message}`,
          `code: ${detail.code}`,
          detail.details ? `details: ${detail.details}` : "details: (none)",
        ].join("\n"),
      },
    ],
  };
}

function formatError(error: unknown): {
  message: string;
  code: string;
  details?: string;
} {
  if (isAppError(error)) {
    return {
      message: error.message,
      code: error.code,
      details:
        error.details === undefined
          ? undefined
          : typeof error.details === "string"
            ? error.details
            : JSON.stringify(error.details),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: "UNEXPECTED_ERROR",
    };
  }

  return {
    message: "不明なエラーが発生しました。",
    code: "UNKNOWN_ERROR",
  };
}
