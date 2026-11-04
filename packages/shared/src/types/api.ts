/** Standard error shape returned by the API. */
export interface ApiError {
  error: {
    message: string;
    details?: unknown;
  };
}
