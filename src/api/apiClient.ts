import { handleRequest } from './router';
import { ApiRequest, ApiResponse } from './types';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

type ApiMode = 'internal' | 'remote';

const normalizeApiMode = (value?: string): ApiMode | null => {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized === 'internal' || normalized === 'remote') {
    return normalized;
  }
  return null;
};

const getApiMode = (): ApiMode => {
  const explicit = normalizeApiMode(process.env.EXPO_PUBLIC_API_MODE);
  if (explicit) return explicit;
  if (Platform.OS !== 'web') return 'remote';
  return process.env.EXPO_PUBLIC_API_BASE_URL ? 'remote' : 'internal';
};

const API_MODE = getApiMode();
const getExpoDevHost = (): string | null => {
  const constantsAny = Constants as any;
  const hostUri =
    constantsAny?.expoConfig?.hostUri ||
    constantsAny?.manifest2?.extra?.expoGo?.debuggerHost ||
    constantsAny?.manifest?.debuggerHost;
  if (!hostUri || typeof hostUri !== 'string') return null;
  const [host] = hostUri.split(':');
  return host || null;
};

const resolveApiBaseUrl = (): string => {
  const raw = (process.env.EXPO_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
  if (!raw) return '';
  if (Platform.OS === 'web') return raw;

  try {
    const parsed = new URL(raw);
    const isLocalhost =
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '::1';

    if (!isLocalhost) return raw;

    const expoHost = getExpoDevHost();
    if (expoHost) {
      parsed.hostname = expoHost;
      return parsed.toString().replace(/\/+$/, '');
    }

    if (Platform.OS === 'android') {
      parsed.hostname = '10.0.2.2';
      return parsed.toString().replace(/\/+$/, '');
    }

    return raw;
  } catch {
    return raw;
  }
};

const API_BASE_URL = resolveApiBaseUrl();

const buildQueryString = (query?: Record<string, unknown>): string => {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.append(key, String(value));
  });
  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
};

class ApiClient {
  private async remoteRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: any,
    query?: any
  ): Promise<ApiResponse<T>> {
    if (!API_BASE_URL) {
      return { status: 500, error: 'EXPO_PUBLIC_API_BASE_URL is not configured' };
    }

    const url = `${API_BASE_URL}${path}${buildQueryString(query)}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      const payload = await response.json().catch(() => null);

      if (payload && typeof payload.status === 'number') {
        return payload as ApiResponse<T>;
      }

      if (!response.ok) {
        return {
          status: response.status,
          error: (payload && payload.error) || `HTTP ${response.status}`,
        };
      }

      return {
        status: response.status,
        data: (payload as T) ?? undefined,
      };
    } catch (error: any) {
      return {
        status: 500,
        error: error?.message || 'Remote API request failed',
      };
    }
  }

  async request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: any, query?: any): Promise<ApiResponse<T>> {
    if (API_MODE === 'remote') {
      return this.remoteRequest<T>(method, path, body, query);
    }

    // Construct request object
    const req: ApiRequest = {
      method,
      path,
      body,
      query
    };

    // Execute via router
    return await handleRequest(req);
  }

  get<T = any>(path: string, query?: any) { return this.request<T>('GET', path, undefined, query); }
  post<T = any>(path: string, body?: any) { return this.request<T>('POST', path, body); }
  put<T = any>(path: string, body?: any) { return this.request<T>('PUT', path, body); }
  delete<T = any>(path: string) { return this.request<T>('DELETE', path); }
}

export const apiClient = new ApiClient();
