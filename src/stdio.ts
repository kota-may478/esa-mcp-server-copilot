#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadConfig } from "./config.js";
import { EsaClient } from "./esa/client.js";
import { createLogger } from "./logger.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const config = loadConfig("stdio");
  const logger = createLogger(config.logLevel);

  const client = new EsaClient({
    accessToken: config.esaAccessToken,
    teamName: config.esaTeamName,
    apiBaseUrl: config.esaApiBaseUrl,
    timeoutMs: config.esaHttpTimeoutMs,
    logger,
  });

  const server = createServer({
    client,
    logger,
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info({ team: config.esaTeamName }, "stdio モードで MCP サーバーを起動しました");
}

void main().catch((error) => {
  if (error instanceof Error) {
    console.error(`[fatal] ${error.message}`);
  } else {
    console.error("[fatal] 不明なエラーが発生しました。");
  }
  process.exit(1);
});
