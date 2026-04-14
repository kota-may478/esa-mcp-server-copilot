import { AppError } from "../errors.js";
import type { Logger } from "../logger.js";
import type {
  EsaCreatePostPayload,
  EsaGetMembersResponse,
  EsaListPostParams,
  EsaListPostsResponse,
  EsaPost,
  EsaUpdatePostPayload,
} from "./types.js";

const DEFAULT_USER_AGENT = "esa-mcp-server-copilot/1.0.0";

interface EsaClientOptions {
  accessToken: string;
  teamName: string;
  apiBaseUrl: string;
  timeoutMs: number;
  logger: Logger;
}

export class EsaClient {
  private readonly accessToken: string;

  private readonly teamName: string;

  private readonly apiBaseUrl: string;

  private readonly timeoutMs: number;

  private readonly logger: Logger;

  constructor(options: EsaClientOptions) {
    this.accessToken = options.accessToken;
    this.teamName = options.teamName;
    this.apiBaseUrl = options.apiBaseUrl.replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs;
    this.logger = options.logger;
  }

  async listPosts(params: EsaListPostParams): Promise<EsaListPostsResponse> {
    const query = new URLSearchParams();
    if (params.q) {
      query.set("q", params.q);
    }
    if (params.per_page) {
      query.set("per_page", String(params.per_page));
    }
    if (params.page) {
      query.set("page", String(params.page));
    }

    const queryString = query.size > 0 ? `?${query.toString()}` : "";
    return this.request<EsaListPostsResponse>("GET", `/posts${queryString}`);
  }

  async getPost(postNumber: number): Promise<EsaPost> {
    return this.request<EsaPost>("GET", `/posts/${postNumber}`);
  }

  async createPost(payload: EsaCreatePostPayload): Promise<EsaPost> {
    return this.request<EsaPost>("POST", "/posts", {
      post: payload,
    });
  }

  async updatePost(postNumber: number, payload: EsaUpdatePostPayload): Promise<EsaPost> {
    return this.request<EsaPost>("PATCH", `/posts/${postNumber}`, {
      post: payload,
    });
  }

  async deletePost(postNumber: number): Promise<void> {
    await this.request("DELETE", `/posts/${postNumber}`);
  }

  async getMembers(): Promise<EsaGetMembersResponse> {
    return this.request<EsaGetMembersResponse>("GET", "/members");
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.apiBaseUrl}/teams/${this.teamName}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.timeoutMs);

    try {
      this.logger.debug({ method, path }, "esa API リクエスト開始");

      const requestInit: RequestInit = {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          "User-Agent": DEFAULT_USER_AGENT,
        },
        signal: controller.signal,
      };

      if (body !== undefined) {
        requestInit.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestInit);

      const text = await response.text();
      const parsedBody = tryParseJson(text);

      if (!response.ok) {
        throw new AppError("esa API がエラーを返しました。", {
          code: "ESA_API_ERROR",
          statusCode: response.status,
          details: {
            method,
            path,
            responseBody: parsedBody,
          },
        });
      }

      this.logger.debug({ method, path, status: response.status }, "esa API リクエスト成功");

      return parsedBody as T;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (isAbortError(error)) {
        throw new AppError(`esa API 呼び出しがタイムアウトしました (${this.timeoutMs}ms)。`, {
          code: "ESA_TIMEOUT",
          details: { method, path, timeoutMs: this.timeoutMs },
          cause: error,
        });
      }

      throw new AppError("esa API 呼び出しに失敗しました。", {
        code: "ESA_NETWORK_ERROR",
        details: { method, path },
        cause: error,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

function tryParseJson(input: string): unknown {
  if (!input) {
    return null;
  }
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return input;
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
