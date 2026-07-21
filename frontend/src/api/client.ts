import axios from 'axios';

// The in-memory access token (mitigates XSS compared to localStorage)
let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => inMemoryAccessToken;

export const apiClient = axios.create({
  // Default to the Django API base for the React web app
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  // MUST be true to automatically send and receive the HttpOnly refresh token cookie
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach the in-memory access token to every request
apiClient.interceptors.request.use((config) => {
  if (inMemoryAccessToken) {
    config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
  }
  return config;
});

// Response Interceptor: Handle 401s and automatically refresh using the HttpOnly cookie
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Ping the refresh endpoint. Since withCredentials is true, 
        // the browser sends the HttpOnly refresh_token cookie automatically.
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/users/auth/refresh/`,
          {},
          { withCredentials: true }
        );
        
        // The backend responds with the new short-lived access token in the JSON body
        const newAccessToken = response.data.access;
        setAccessToken(newAccessToken);

        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, they are fully logged out. Clear memory.
        setAccessToken('');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
