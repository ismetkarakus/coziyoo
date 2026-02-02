import { ApiRequest, ApiResponse } from './types';
import { authController } from './controllers/authController';
import { foodController } from './controllers/foodController';
import { orderController } from './controllers/orderController';
import { chatController } from './controllers/chatController';
import { reviewController } from './controllers/reviewController';

// Simple regex router matching
type Handler = (req: ApiRequest) => Promise<ApiResponse>;

interface Route {
  method: string;
  pattern: RegExp;
  handler: Handler;
  keys: string[];
}

const routes: Route[] = [];

const addRoute = (method: string, path: string, handler: Handler) => {
  const keys: string[] = [];
  // Convert /path/:id to regex
  const regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
    keys.push(key);
    return '([^/]+)';
  });
  
  routes.push({
    method,
    pattern: new RegExp(`^${regexPath}$`),
    handler,
    keys
  });
};

// --- Auth Routes ---
addRoute('POST', '/auth/register', authController.register);
addRoute('POST', '/auth/login', authController.login);
addRoute('GET', '/auth/me/:uid', authController.getProfile);

// --- Food Routes ---
addRoute('GET', '/foods', foodController.getAll);
addRoute('POST', '/foods', foodController.create);
addRoute('GET', '/foods/:id', foodController.getById);

// --- Order Routes ---
addRoute('POST', '/orders', orderController.create);
addRoute('GET', '/orders', orderController.list);
addRoute('PUT', '/orders/:id/status', orderController.updateStatus);

// --- Chat Routes ---
addRoute('GET', '/chats', chatController.list);
addRoute('POST', '/chats', chatController.create);
addRoute('GET', '/chats/:id/messages', chatController.getMessages);
addRoute('POST', '/chats/:id/messages', chatController.sendMessage);

// --- Review Routes ---
addRoute('POST', '/reviews', reviewController.create);
addRoute('GET', '/reviews', reviewController.getByFood);

export const handleRequest = async (req: ApiRequest): Promise<ApiResponse> => {
  // Split path and query
  const [cleanPath, queryString] = req.path.split('?');
  
  console.log(`[Internal API] ${req.method} ${cleanPath}`);

  // Find matching route
  const route = routes.find(r => {
    if (r.method !== req.method) return false;
    return r.pattern.test(cleanPath);
  });

  if (!route) {
    console.warn(`[Internal API] 404 Not Found: ${cleanPath}`);
    return { status: 404, error: 'Endpoint not found' };
  }

  // Extract params
  const match = route.pattern.exec(cleanPath);
  const params: any = {};
  if (match) {
    route.keys.forEach((key, index) => {
      params[key] = match[index + 1];
    });
  }

  // Parse query string if it exists and merge with provided query object
  const parsedQuery: any = { ...req.query };
  if (queryString) {
      queryString.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          parsedQuery[key] = decodeURIComponent(value || '');
      });
  }

  // Inject params and query into request
  const requestWithParams = { 
      ...req, 
      path: cleanPath,
      params: { ...req.params, ...params },
      query: parsedQuery
  };

  try {
    return await route.handler(requestWithParams);
  } catch (error: any) {
    console.error(`[Internal API] 500 Error:`, error);
    return { status: 500, error: 'Internal Server Error' };
  }
};
