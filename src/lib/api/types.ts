export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: unknown;
  metadata?: {
    timestamp?: string;
    path?: string;
    request_id?: string;
    status_code?: number;
  };
};

export type PaginatedResponse<T> = {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

export function unwrapApiResponse<T>(response: T | ApiResponse<T>): T {
  if (
    response &&
    typeof response === "object" &&
    "success" in response &&
    "data" in response
  ) {
    return (response as ApiResponse<T>).data as T;
  }

  return response as T;
}
