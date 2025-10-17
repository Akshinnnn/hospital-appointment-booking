import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- API Service Functions ---
export const getSpecializations = () => api.get<string[]>('/api/doctor/specializations');

export const getDoctorsBySpecialization = (specialization: string) => 
  api.get(`/api/doctor/${specialization}`);

export const getDoctorSchedule = (doctorId: string, date: string) => 
  api.get(`/api/${doctorId}/schedule?date=${date}`);

export const createAppointment = (data: { doctorId: string; appointmentTime: string; notes?: string; }) => 
  api.post('/api/appointment', data);

export default api;