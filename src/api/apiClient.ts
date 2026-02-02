import { handleRequest } from './router';
import { ApiRequest, ApiResponse } from './types';

class ApiClient {
  async request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: any, query?: any): Promise<ApiResponse<T>> {
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
