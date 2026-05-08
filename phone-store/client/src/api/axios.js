import axios from 'axios';

const instance = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// Tự động gắn Authorization token vào mọi request
instance.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.accessToken) {
    config.headers.Authorization = `Bearer ${user.accessToken}`;
  }
  return config;
});

// Tự động xử lý 401 — token hết hạn
instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user?.refreshToken) {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
            refreshToken: user.refreshToken,
          });
          const updated = { ...user, accessToken: data.data.accessToken };
          localStorage.setItem('user', JSON.stringify(updated));
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return instance(original);
        }
      } catch {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default instance;
