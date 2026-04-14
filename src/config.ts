import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import { z } from "zod";

const levelSchema = z.enum(["trace", "debug", "info", "warn", "error", "fatal"]);

const envSchema = z.object({
  ESA_ACCESS_TOKEN: z.string().min(1, "ESA_ACCESS_TOKEN は必須です。"),
  ESA_TEAM_NAME: z
    .string()
    .min(1, "ESA_TEAM_NAME は必須です。")
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/, "ESA_TEAM_NAME の形式が不正です。"),
  ESA_API_BASE_URL: z.string().url().default("https://api.esa.io/v1"),
  ESA_HTTP_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(15000),
  LOG_LEVEL: levelSchema.default("info"),
  MCP_HTTP_HOST: z.string().min(1).default("127.0.0.1"),
  MCP_HTTP_PORT: z.coerce.number().int().min(1).max(65535).default(8787),
  MCP_AUTH_TOKEN: z.string().min(16).optional(),
});

export type AppConfig = {
  esaAccessToken: string;
  esaTeamName: string;
  esaApiBaseUrl: string;
  esaHttpTimeoutMs: number;
  logLevel: z.infer<typeof levelSchema>;
  mcpHttpHost: string;
  mcpHttpPort: number;
  mcpAuthToken?: string;
};

function loadEnvFiles(): void {
  // Prefer .env.local and use .env as a fallback for missing keys.
  const candidates = [".env.local", ".env"];
  for (const fileName of candidates) {
    const fullPath = resolve(process.cwd(), fileName);
    if (existsSync(fullPath)) {
      loadDotenv({ path: fullPath, quiet: true });
    }
  }
}

loadEnvFiles();

function readProcessEnv() {
  return {
    ESA_ACCESS_TOKEN: process.env.ESA_ACCESS_TOKEN,
    ESA_TEAM_NAME: process.env.ESA_TEAM_NAME,
    ESA_API_BASE_URL: process.env.ESA_API_BASE_URL,
    ESA_HTTP_TIMEOUT_MS: process.env.ESA_HTTP_TIMEOUT_MS,
    LOG_LEVEL: process.env.LOG_LEVEL,
    MCP_HTTP_HOST: process.env.MCP_HTTP_HOST,
    MCP_HTTP_PORT: process.env.MCP_HTTP_PORT,
    MCP_AUTH_TOKEN: process.env.MCP_AUTH_TOKEN,
  };
}

export function loadConfig(mode: "stdio" | "http"): AppConfig {
  const parsed = envSchema.safeParse(readProcessEnv());

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => {
      const path = issue.path.join(".") || "(root)";
      return `- ${path}: ${issue.message}`;
    });
    throw new Error(`環境変数の検証に失敗しました。\n${details.join("\n")}`);
  }

  if (mode === "http" && !parsed.data.MCP_AUTH_TOKEN) {
    throw new Error(
      "HTTP モードでは MCP_AUTH_TOKEN が必須です。16文字以上のランダム値を設定してください。",
    );
  }

  return {
    esaAccessToken: parsed.data.ESA_ACCESS_TOKEN,
    esaTeamName: parsed.data.ESA_TEAM_NAME,
    esaApiBaseUrl: parsed.data.ESA_API_BASE_URL.replace(/\/$/, ""),
    esaHttpTimeoutMs: parsed.data.ESA_HTTP_TIMEOUT_MS,
    logLevel: parsed.data.LOG_LEVEL,
    mcpHttpHost: parsed.data.MCP_HTTP_HOST,
    mcpHttpPort: parsed.data.MCP_HTTP_PORT,
    mcpAuthToken: parsed.data.MCP_AUTH_TOKEN,
  };
}
