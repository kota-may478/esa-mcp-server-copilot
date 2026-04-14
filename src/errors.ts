export class AppError extends Error {
  public readonly code: string;

  public readonly statusCode?: number;

  public readonly details?: unknown;

  constructor(
    message: string,
    options: {
      code: string;
      statusCode?: number;
      details?: unknown;
      cause?: unknown;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.details = options.details;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
