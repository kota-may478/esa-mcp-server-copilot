import pino from "pino";

export type Logger = pino.Logger;

export function createLogger(level: pino.LevelWithSilent): Logger {
  const destination = pino.destination({
    fd: 2,
    sync: false,
  });

  return pino(
    {
      name: "esa-mcp-server-copilot",
      level,
      timestamp: pino.stdTimeFunctions.isoTime,
      base: null,
    },
    destination,
  );
}
