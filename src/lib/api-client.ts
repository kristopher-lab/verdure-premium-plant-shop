import type { ApiResponse } from "../../shared/types";
export class ApiError extends Error {
  status?: number;
  error?: string;
  constructor(message: string, status?: number, error?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.error = error;
  }
}
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success || json.data === undefined) {
    throw new ApiError(json.error || 'Request failed', res.status, json.error);
  }
  return json.data;
}
export const get = <T>(path: string, init?: RequestInit) => api<T>(path, { method: 'GET', ...init });
export const post = <T>(path:string, body: unknown, init?: RequestInit) => api<T>(path, { method: 'POST', body: JSON.stringify(body), ...init });
export const put = <T>(path:string, body: unknown, init?: RequestInit) => api<T>(path, { method: 'PUT', body: JSON.stringify(body), ...init });
export const del = <T>(path:string, init?: RequestInit) => api<T>(path, { method: 'DELETE', ...init });