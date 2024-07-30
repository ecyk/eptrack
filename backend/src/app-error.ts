export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    isOperational?: boolean,
    stack?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational ?? true;
    if (stack !== undefined) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
