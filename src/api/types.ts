export interface ApiRequest {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: any;
  query?: any;
}

export interface ApiResponse<T = any> {
  status: number;
  data?: T;
  error?: string;
}
