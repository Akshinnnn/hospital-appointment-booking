'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { getSpecializations, getDoctorsBySpecialization, getDoctorSchedule, createAppointment } from '@/lib/api';

// --- UI Components ---
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Doctor {
  id: string;
  full_Name: string;
}

interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
}

// --- Zod Schema ---
const appointmentSchema = z.object({
  specialization: z.string().min(1, "Specialization is required."),
  doctorId: z.string().min(1, "Please select a doctor."),
  appointmentTime: z.string().min(1, "Please select a time slot."),
  appointmentDate: z.string().min(1, "Date is required."),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export const CreateAppointmentForm = () => {
  const router = useRouter();
  
  // State for data fetched from API
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);

  // State for UI feedback
  const [apiError, setApiError] = useState<string | null>(null);
  
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      specialization: '',
      doctorId: '',
      appointmentTime: '',
      appointmentDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const selectedSpecialization = form.watch('specialization');
  const selectedDoctorId = form.watch('doctorId');
  const selectedDate = form.watch('appointmentDate');

  // specializations on mount
  useEffect(() => {
    getSpecializations()
      .then(response => setSpecializations(response.data))
      .catch(() => setApiError("Could not load specializations."));
  }, []);

  // doctors when specialization changes
  useEffect(() => {
    if (selectedSpecialization) {
      form.setValue('doctorId', '');
      getDoctorsBySpecialization(selectedSpecialization)
        .then(response => setDoctors(response.data))
        .catch(() => setApiError("Could not find doctors for this specialty."));
    }
  }, [selectedSpecialization, form.setValue]);

  // schedule when doctor or date changes
  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      form.setValue('appointmentTime', '');
      getDoctorSchedule(selectedDoctorId, selectedDate)
        .then(response => setSchedule(response.data))
        .catch(() => setApiError("Could not load the doctor's schedule."));
    }
  }, [selectedDoctorId, selectedDate, form.setValue]);
  
  const onSubmit = async (data: AppointmentFormData) => {
    setApiError(null);
    try {
      await createAppointment({
        doctorId: data.doctorId,
        appointmentTime: data.appointmentTime,
        notes: data.notes,
      });
      alert('Appointment booked successfully!');
      router.push('/appointments');
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'An error occurred during booking.');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* --- Specialization --- */}
      <div className="space-y-2">
        <Label>1. Select Specialization</Label>
        <Controller
          control={form.control}
          name="specialization"
          render={({ field }) => (
             <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="-- Choose a specialization --" /></SelectTrigger>
                <SelectContent>
                  {specializations.map(spec => <SelectItem key={spec} value={spec}>{spec}</SelectItem>)}
                </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.specialization && <p className="text-red-500 text-sm">{form.formState.errors.specialization.message}</p>}
      </div>

      {/* --- Doctor --- */}
      {doctors.length > 0 && (
        <div className="space-y-2">
            <Label>2. Select a Doctor</Label>
            <Controller
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="-- Choose a doctor --" /></SelectTrigger>
                    <SelectContent>
                      {doctors.map(doc => <SelectItem key={doc.id} value={doc.id}>{doc.full_Name}</SelectItem>)}
                    </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.doctorId && <p className="text-red-500 text-sm">{form.formState.errors.doctorId.message}</p>}
        </div>
      )}

      {/* --- Date & Time --- */}
      {selectedDoctorId && (
        <div className="space-y-2">
          <Label>3. Select a Date</Label>
          <Input type="date" {...form.register('appointmentDate')} />
          
          <div className="space-y-2 pt-4">
            <Label>Available Slots</Label>
            <div className="flex flex-wrap gap-2">
                {schedule.filter(s => s.isAvailable).map(slot => (
                  <Button 
                    key={slot.start} 
                    type="button"
                    variant={form.getValues('appointmentTime') === slot.start ? 'default' : 'outline'}
                    onClick={() => form.setValue('appointmentTime', slot.start, { shouldValidate: true })}
                  >
                    {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Button>
                ))}
            </div>
            {form.formState.errors.appointmentTime && <p className="text-red-500 text-sm">{form.formState.errors.appointmentTime.message}</p>}
          </div>
        </div>
      )}

      {/* --- Notes & Submission --- */}
      {form.getValues('appointmentTime') && (
          <div className="space-y-2">
              <Label htmlFor="notes">4. Add Notes (Optional)</Label>
              <Textarea id="notes" placeholder="Any specific details for the doctor..." {...form.register('notes')} />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Booking...' : 'Confirm Appointment'}
              </Button>
          </div>
      )}
      
      {apiError && <p className="text-red-500 text-sm mt-4">{apiError}</p>}
    </form>
  );
};