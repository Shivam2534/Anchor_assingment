import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/users/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Poll services
export const pollService = {
  createPoll: async (pollData: {
    title: string;
    description: string;
    options: string[];
    endDate: Date;
  }) => {
    const response = await api.post('/polls', pollData);
    return response.data;
  },

  getPolls: async () => {
    const response = await api.get('/polls');
    return response.data;
  },

  getPoll: async (id: string) => {
    const response = await api.get(`/polls/${id}`);
    return response.data;
  },

  vote: async (pollId: string, option: string) => {
    const response = await api.post(`/polls/${pollId}/vote`, { option });
    return response.data;
  },

  endPoll: async (pollId: string) => {
    const response = await api.post(`/polls/${pollId}/end`);
    return response.data;
  },
};

export default api; 