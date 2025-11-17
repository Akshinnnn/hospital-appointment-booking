import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;

  console.log("=== API Request ===");
  console.log("URL:", config.url);
  console.log("Method:", config.method);
  console.log("Token found:", token ? "Yes" : "No (Anonymous)");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error("Request interceptor error:", error);
  return Promise.reject(error);
});

// Response interceptor to handle ApiResponse<T> structure
api.interceptors.response.use(
  (response) => {
    // Backend returns ApiResponse<T> with structure: { success: true, data: T, message: string }
    // Unwrap the data property automatically, but skip arrays (they're returned directly)
    if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      // Check if it's an ApiResponse structure
      if ('data' in response.data && ('success' in response.data || 'Success' in response.data)) {
        // Return the unwrapped data
        response.data = response.data.data || response.data.Data;
      }
    }
    return response;
  },
  (error) => {
    // Handle error responses - they also use ApiResponse structure
    if (error.response?.data && typeof error.response.data === 'object' && !Array.isArray(error.response.data)) {
      if ('message' in error.response.data || 'Message' in error.response.data) {
        error.response.data.message = error.response.data.message || error.response.data.Message;
      }
    }
    return Promise.reject(error);
  }
);

// --- API Service Functions ---
export const getSpecializations = () => api.get<string[]>('/api/doctor/specialisations');

export const getDoctorsBySpecialization = (specialization: string) => 
  api.get(`/api/doctor/${encodeURIComponent(specialization)}`);

export const getDoctorSchedule = (doctorId: string, date: string) => {
  // Format date as ISO string for the backend
  // Ensure the date is sent at UTC midnight to avoid timezone issues
  const dateObj = new Date(date + 'T00:00:00Z');
  const isoDate = dateObj.toISOString();
  const url = `/api/schedule/doctor/${doctorId}?date=${encodeURIComponent(isoDate)}`;
  
  console.log('getDoctorSchedule called with:', { doctorId, date, isoDate, url });
  
  return api.get(url);
};

export const createAppointment = (data: {
  doctorId: string;
  appointmentTime: string | Date;
  notes?: string;
  fullName?: string;
  email?: string; 
}) => {
  // Convert appointmentTime to ISO string if it's not already
  const appointmentTime = typeof data.appointmentTime === 'string'
    ? new Date(data.appointmentTime).toISOString() 
    : data.appointmentTime.toISOString();
  
  // Map to backend DTO structure (backend uses camelCase due to PropertyNamingPolicy)
  const appointmentDTO = {
    doctorId: data.doctorId,
    appointmentTime: appointmentTime,
    notes: data.notes || null,
    fullName: data.fullName || null,
    email: data.email || null,
  };
  
  return api.post('/api/appointment', appointmentDTO);
};

export const getMyAppointments = () => api.get('/api/appointment/myappointments')

export const cancelAppointment = (id: string) => api.put(`/api/appointment/${id}`, { status: 'CANCELLED' });

//MOCK
export const getMyRecords = () => {
  console.log("Fetching medical records...");
  
  //return api.get('/api/records/myrecords');
  return Promise.resolve({ data: [] });
}

export const getAccountDetails = () => api.get('/api/account');

export const updateAccountDetails = (data: {
  full_Name?: string;
  email?: string;
  phone_Number?: string;
}) => {

  return api.put('api/account', data);
}

export const registerUser = (data: {
  full_Name: string;
  email: string;
  password?: string;
  phone_Number?: string;
}) => {
  return api.post('/api/auth/register', data);
}

export default api;