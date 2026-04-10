// Mock API implementation for serverless/demo mode
import { API_BASE_URL } from '@/constants/config';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

// Dummy request function that logs and returns empty promises
async function request(path: string, options: RequestInit = {}) {
  console.log(`[Mock API] Request to ${path}`, options);
  return Promise.resolve({});
}

export const api = {
  postForm: async (path: string, form: FormData) => {
    console.log(`[Mock API] POST Form to ${path}`);
    return Promise.resolve({});
  },
  get: (path: string) => request(path),
  post: (path: string, body?: any) => request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path: string, body?: any) => request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (path: string, body?: any) => request(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
};

