export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};
