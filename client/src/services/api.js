import axios from 'axios';

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'https://your-production-api.com' // ✅ change to your deployed backend URL
      : 'http://localhost:5000', // ✅ for local dev
  withCredentials: true, // important for refresh cookies
});

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

// ✅ Attach Authorization header to every request
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  refreshQueue = [];
};

// ✅ Combined response interceptor (includes your logic + silent 401 filter)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // --- 🧩 NEW: optional tweak to silence 401 from /auth/refresh ---
    if (
      error.response?.status === 401 &&
      originalRequest?.url?.includes('/auth/refresh')
    ) {
      console.warn('⚠️ No active session (hidden 401)');
      return Promise.resolve({ data: { success: false } });
    }

    // 🔄 Handle expired access token (retry after refresh)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post('/auth/refresh');
        const newToken = res?.data?.data?.accessToken;
        if (!newToken) throw new Error('No new token received');

        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log('✅ Access token refreshed');
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        console.warn('🔒 Session expired. Redirecting to login...');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
