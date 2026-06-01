/**
 * Base API Client wrapper with HTTP error handling and a Mock Fallback Mode.
 * This allows the frontend to run fully with high-quality mock data when
 * the Fastify backend is offline or during initial frontend layout development.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Toggle mock mode via env or localStorage (fallback to true for easy development)
const isBrowser = typeof window !== 'undefined';
export const isMockMode = (): boolean => {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'false') return false;
  if (isBrowser) {
    const localOverride = localStorage.getItem('NEXT_PUBLIC_USE_MOCK');
    if (localOverride !== null) {
      return localOverride === 'true';
    }
  }
  return true; // Default to true so the dashboard is immediately interactive
};

export const setMockMode = (enabled: boolean) => {
  if (isBrowser) {
    localStorage.setItem('NEXT_PUBLIC_USE_MOCK', String(enabled));
    window.location.reload();
  }
};

class ApiError extends Error {
  status: number;
  info?: any;

  constructor(message: string, status: number, info?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.info = info;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  });

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorInfo;
      try {
        errorInfo = await response.json();
      } catch {
        errorInfo = null;
      }
      throw new ApiError(
        errorInfo?.message || `HTTP error! Status: ${response.status}`,
        response.status,
        errorInfo
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      500
    );
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
