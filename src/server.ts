import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import type { EsaClient } from "./esa/client.js";
import type { Logger } from "./logger.js";
import { handleToolCall } from "./mcp/handlers.js";
import { ESA_TOOL_DEFINITIONS } from "./mcp/toolDefinitions.js";

interface CreateServerOptions {
  client: EsaClient;
  logger: Logger;
}

export function createServer(options: CreateServerOptions): Server {
  const server = new Server(
    {
      name: "esa-mcp-server-copilot",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [...ESA_TOOL_DEFINITIONS],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const toolArgs = request.params.arguments;

    options.logger.info({ toolName }, "MCP ツールを実行します");

    return handleToolCall(toolName, toolArgs, {
      client: options.client,
      logger: options.logger,
    });
  });

  return server;
}
