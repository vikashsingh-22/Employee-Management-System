import axios from 'axios';

const API_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password, role) => {
    const response = await api.post('/api/auth/login', { email, password, role });
    return response.data;
  },

  signup: async (userData) => {
    const response = await api.post('/api/auth/signup', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  /**
   * Update the current user's own profile (except email).
   * @param {object} profileData - The fields to update (e.g. name, position, department, etc.)
   * @returns {object} Updated user profile
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/me', profileData);
    return response.data;
  },
  
  /**
   * Upload profile photo to Cloudinary and update user profile.
   * @param {string} imageUrl - The Cloudinary image URL to save to user profile
   * @param {string} publicId - The Cloudinary public ID for the image (used for deletion)
   * @returns {object} Updated user profile
   */
  uploadProfilePhoto: async (imageUrl, publicId) => {
    const response = await api.post('/api/auth/upload-profile-photo', { imageUrl, publicId });
    return response.data;
  },
};

export const employeeService = {
  getEmployees: async () => {
    const response = await api.get('/api/employees');
    return response.data;
  },

  getEmployee: async (id) => {
    const response = await api.get(`/api/employees/${id}`);
    return response.data;
  },

  updateEmployee: async (id, data) => {
    const response = await api.put(`/api/employees/${id}`, data);
    return response.data;
  },
};

export const taskService = {
  getTasks: async () => {
    const response = await api.get('/api/tasks');
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await api.put(`/api/tasks/${id}`, taskData);
    return response.data;
  },
};

export const leaveService = {
  getLeaves: async () => {
    const response = await api.get('/api/leaves');
    return response.data;
  },

  createLeave: async (leaveData) => {
    const response = await api.post('/api/leaves', leaveData);
    return response.data;
  },

  updateLeave: async (id, leaveData) => {
    const response = await api.put(`/api/leaves/${id}`, leaveData);
    return response.data;
  },
};

export const attendanceService = {
  markAttendance: async (attendanceData) => {
    const response = await api.post('/api/attendance/mark', attendanceData);
    return response.data;
  },

  getAttendanceRecords: async (filters) => {
    const response = await api.get('/api/attendance/records', { params: filters });
    return response.data;
  },

  markHoliday: async (holidayData) => {
    const response = await api.post('/api/attendance/holiday', holidayData);
    return response.data;
  },

  getHolidays: async (filters) => {
    const response = await api.get('/api/attendance/holidays', { params: filters });
    return response.data;
  },

  getAttendanceSummary: async (employeeId, filters) => {
    const response = await api.get(`/api/attendance/summary/${employeeId}`, { params: filters });
    return response.data;
  },
};

export default api;