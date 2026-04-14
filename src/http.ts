#!/usr/bin/env node
import { timingSafeEqual } from "node:crypto";
import {
  createServer as createNodeServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { loadConfig } from "./config.js";
import { EsaClient } from "./esa/client.js";
import { createLogger } from "./logger.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const config = loadConfig("http");
  const logger = createLogger(config.logLevel);

  const client = new EsaClient({
    accessToken: config.esaAccessToken,
    teamName: config.esaTeamName,
    apiBaseUrl: config.esaApiBaseUrl,
    timeoutMs: config.esaHttpTimeoutMs,
    logger,
  });

  const nodeServer = createNodeServer((req, res) => {
    void handleRequest(req, res, {
      authToken: config.mcpAuthToken!,
      client,
      logger,
      host: config.mcpHttpHost,
      port: config.mcpHttpPort,
    });
  });

  nodeServer.listen(config.mcpHttpPort, config.mcpHttpHost, () => {
    logger.info(
      {
        host: config.mcpHttpHost,
        port: config.mcpHttpPort,
      },
      "HTTP モードで MCP サーバーを起動しました",
    );
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT を受信したため HTTP サーバーを停止します");
    nodeServer.close(() => process.exit(0));
  });

  process.on("SIGTERM", () => {
    logger.info("SIGTERM を受信したため HTTP サーバーを停止します");
    nodeServer.close(() => process.exit(0));
  });
}

interface HandleRequestContext {
  authToken: string;
  client: EsaClient;
  logger: ReturnType<typeof createLogger>;
  host: string;
  port: number;
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  context: HandleRequestContext,
): Promise<void> {
  const requestUrl = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? `${context.host}:${context.port}`}`,
  );

  if (requestUrl.pathname === "/health") {
    sendJson(res, 200, {
      status: "ok",
      service: "esa-mcp-server-copilot",
    });
    return;
  }

  if (requestUrl.pathname !== "/mcp") {
    sendJson(res, 404, {
      error: "Not Found",
      message: "利用可能なパスは /mcp と /health です。",
    });
    return;
  }

  if (!isAuthorized(req, requestUrl, context.authToken)) {
    sendJson(res, 401, {
      error: "Unauthorized",
      message: "token クエリまたは Bearer トークンが不正です。",
    });
    return;
  }

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    const server = createServer({
      client: context.client,
      logger: context.logger,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch (error) {
    context.logger.error({ err: error }, "HTTP リクエスト処理に失敗しました");

    if (!res.headersSent) {
      sendJson(res, 500, {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "不明なエラー",
      });
    }
  }
}

function isAuthorized(req: IncomingMessage, requestUrl: URL, expectedToken: string): boolean {
  const queryToken = requestUrl.searchParams.get("token");
  const bearerToken = parseBearerToken(req.headers.authorization);

  if (queryToken && secureEquals(queryToken, expectedToken)) {
    return true;
  }

  if (bearerToken && secureEquals(bearerToken, expectedToken)) {
    return true;
  }

  return false;
}

function parseBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (!scheme || !token) {
    return null;
  }

  if (scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token;
}

function secureEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(payload));
}

void main().catch((error) => {
  if (error instanceof Error) {
    console.error(`[fatal] ${error.message}`);
  } else {
    console.error("[fatal] 不明なエラーが発生しました。");
  }
  process.exit(1);
});
