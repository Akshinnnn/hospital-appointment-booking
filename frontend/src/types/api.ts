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
  fullName: string;
  email: string;
  appointmentTime: string;
  status: AppointmentStatus;
  appointmentNumber: string;
  notes?: string;
  doctorName?: string;
  specialization?: string;
}

// Schedule DTOs (for API requests/responses)
export interface AddScheduleDTO {
  start_Time: string; // ISO string
  end_Time: string; // ISO string
}

export interface ScheduleDTO {
  start_Time: string; // ISO string
  end_Time: string; // ISO string
}

export interface DoctorSchedule {
  id: string;
  doctor_Id: string;
  start_Time: string;
  end_Time: string;
}

// TimeSlotDTO from backend doesn't include id/doctorId
export interface TimeSlot {
  start: string; // ISO string
  end: string; // ISO string
  isAvailable: boolean;
}

// --- Medical Record Models ---
export interface AddMedicalRecordDTO {
  patient_Id: string;
  title?: string;
  description?: string;
  file: File;
}

export interface UpdateMedicalRecordDTO {
  title?: string;
  description?: string;
  contentType?: string;
}

export interface MedicalRecord {
  id: string;
  patient_Id: string;
  doctor_Id: string;
  title?: string;
  description?: string;
  createdAt: string;
  filePath?: string;
  fileName?: string;
  contentType?: string;
}