// --- Enums ---
export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';
export type AppointmentStatus = 'APPROVED' | 'CANCELLED';

// --- User & Auth Models ---
export interface User {
  id: string;
  full_Name: string;
  email: string;
  phone_Number?: string;
  role: UserRole;
  specialisation?: string;
  created_At: string; 
}

export interface LoginDTO {
  email: string;
  password?: string;
}

export interface RegisterDTO {
  full_Name: string;
  email: string;
  phone_Number?: string;
  password?: string;
  role: UserRole;
  specialisation?: string;
}

export interface UpdateUserDTO {
  full_Name?: string;
  email?: string;
  phone_Number?: string;
}

// --- Appointment & Schedule Models ---
export interface Appointment {
  id: string;
  doctorId: string;
  patientId?: string;
  appointmentTime: string;
  status: AppointmentStatus;
  notes?: string;
  fullName: string;
  email: string;
}

export interface DoctorSchedule {
  id: string;
  doctor_Id: string;
  start_Time: string;
  end_Time: string;
}

export interface TimeSlot {
  id: string; 
  doctorId: string;
  start: string; 
  end:string; 
  isAvailable: boolean;
}

// --- Medical Record Models ---
export interface MedicalRecord {
  id: string;
  patient_Id: string;
  doctor_Id: string;
  title: string;
  description?: string;
  createdAt: string;
  filePath?: string;
  fileName?: string;
  contentType?: string;
}