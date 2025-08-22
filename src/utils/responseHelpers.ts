export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: any;
}

export function success<T>(data: T, message?: string): SuccessResponse<T> {
  return { success: true, data, message };
}

export function errorResponse(message: string, error?: any): ErrorResponse {
  return { success: false, message, error };
}