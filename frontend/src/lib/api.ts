import axios from 'axios';
import { log } from 'console';

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');

  console.log("Attaching token to request:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- API Service Functions ---
//export const getSpecializations = () => api.get<string[]>('/api/doctor/specialisations');
//MOCK
export const getSpecializations = () => {
  return Promise.resolve({ 
    data: ['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics'] 
  });
};

// export const getDoctorsBySpecialization = (specialization: string) => 
//   api.get(`/api/doctor/${specialization}`);
//MOCK
export const getDoctorsBySpecialization = (specialization: string) => {
  console.log("MOCK: Fetching doctors for", specialization);
  const fakeDoctors = [
    { id: 'doc-1', full_Name: `Dr. Alice Smith (${specialization})` },
    { id: 'doc-2', full_Name: `Dr. Bob Johnson (${specialization})` },
  ];
  return Promise.resolve({ data: fakeDoctors });
};

// export const getDoctorSchedule = (doctorId: string, date: string) => 
//   api.get(`/api/${doctorId}/schedule?date=${date}`);
//MOCK
export const getDoctorSchedule = (doctorId: string, date: string) => {
  console.log("MOCK: Fetching schedule for doctor", doctorId, "on", date);
  const fakeSchedule = [
    { start: `${date}T09:00:00Z`, end: `${date}T09:30:00Z`, isAvailable: true },
    { start: `${date}T09:30:00Z`, end: `${date}T10:00:00Z`, isAvailable: true },
    { start: `${date}T10:00:00Z`, end: `${date}T10:30:00Z`, isAvailable: false },
    { start: `${date}T10:30:00Z`, end: `${date}T11:00:00Z`, isAvailable: true },
  ];
  return Promise.resolve({ data: fakeSchedule });
};

// export const createAppointment = (data: { doctorId: string; appointmentTime: string; notes?: string; }) => 
//   api.post('/api/appointment', data);
//MOCK
export const createAppointment = (data: { doctorId: string; appointmentTime: string; notes?: string; }) => {
  console.log("MOCK: Creating appointment with data:", data);
  return Promise.resolve({ 
    data: {
      id: 'fake-appt-id-123',
      ...data,
      status: 'APPROVED',
      patientId: 'fake-patient-id-456'
    }
  });
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

  return axios.post("http://localhost:8080/api/auth/register", data);
}

export default api;