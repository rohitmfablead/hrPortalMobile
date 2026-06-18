import api from './api';

export const employeeAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    // If data contains FormData, interceptor will naturally let the browser set boundary if we omit content-type here,
    // but axios usually handles it automatically if we pass FormData.
    const response = await api.post('/employees', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/employees/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
  
  updateMe: async (data: any) => {
    const response = await api.put('/employees/me', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return response.data;
  }
};
