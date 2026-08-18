import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (email: string, name: string, password: string) => api.post('/auth/register', { email, name, password }),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export const documentsApi = {
  list: () => api.get('/documents'),
  create: (title?: string) => api.post('/documents', { title }),
  get: (id: string) => api.get(`/documents/${id}`),
  updateTitle: (id: string, title: string) => api.patch(`/documents/${id}/title`, { title }),
  delete: (id: string) => api.delete(`/documents/${id}`),
  getByShareToken: (token: string) => api.get(`/documents/share/${token}`),
  addMember: (id: string, email: string, role: string) => api.post(`/documents/${id}/members`, { email, role }),
  getMembers: (id: string) => api.get(`/documents/${id}/members`),
};

export default api;
