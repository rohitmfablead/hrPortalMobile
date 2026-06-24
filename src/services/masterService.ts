import api from './api';

// --- Departments ---
export const getDepartments = async () => {
  const response = await api.get('/departments');
  return response.data;
};

export const createDepartment = async (data: { name: string; description?: string; isActive?: boolean }) => {
  const response = await api.post('/departments', data);
  return response.data;
};

export const updateDepartment = async (id: string, data: Partial<{ name: string; description: string; isActive: boolean }>) => {
  const response = await api.put(`/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: string) => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};

// --- Designations ---
export const getDesignations = async () => {
  const response = await api.get('/designations');
  return response.data;
};

export const createDesignation = async (data: { title: string; departmentId: string; isActive?: boolean }) => {
  const response = await api.post('/designations', data);
  return response.data;
};

export const updateDesignation = async (id: string, data: Partial<{ title: string; departmentId: string; isActive: boolean }>) => {
  const response = await api.put(`/designations/${id}`, data);
  return response.data;
};

export const deleteDesignation = async (id: string) => {
  const response = await api.delete(`/designations/${id}`);
  return response.data;
};

// --- Leave Types ---
export const getLeaveTypes = async () => {
  const response = await api.get('/leave-types');
  return response.data;
};

export const createLeaveType = async (data: { name: string; description?: string }) => {
  const response = await api.post('/leave-types', data);
  return response.data;
};

export const updateLeaveType = async (id: string, data: Partial<{ name: string; description: string }>) => {
  const response = await api.put(`/leave-types/${id}`, data);
  return response.data;
};

export const deleteLeaveType = async (id: string) => {
  const response = await api.delete(`/leave-types/${id}`);
  return response.data;
};
