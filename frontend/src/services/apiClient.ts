const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const SESSION_KEY = 'crms-auth-session';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildQuery(query?: RequestOptions['query']): string {
  if (!query) {
    return '';
  }
  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return params.length ? `?${params.join('&')}` : '';
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return null;
  }

  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { token?: string | null };
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = (import.meta as ImportMeta).env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  const queryString = buildQuery(options.query);
  const headers: Record<string, string> = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers ?? {}),
  };

  if (options.auth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Basic ${token}`;
    }
  }

  const response = await fetch(`${baseUrl}${path}${queryString}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions) {
    return apiRequest<T>(path, { ...options, method: 'GET' });
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return apiRequest<T>(path, { ...options, method: 'POST', body });
  },
  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return apiRequest<T>(path, { ...options, method: 'PUT', body });
  },
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return apiRequest<T>(path, { ...options, method: 'PATCH', body });
  },
  delete<T>(path: string, options?: RequestOptions) {
    return apiRequest<T>(path, { ...options, method: 'DELETE' });
  },
};
