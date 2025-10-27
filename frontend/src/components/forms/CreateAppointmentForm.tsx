'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getSpecializations, getDoctorsBySpecialization, getDoctorSchedule, createAppointment } from '@/lib/api';

// --- UI Components ---
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Doctor {
  id: string;
  full_Name: string;
}

interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
}

// --- Zod Schema for authenticated users ---
const authenticatedAppointmentSchema = z.object({
  specialization: z.string().min(1, "Specialization is required."),
  doctorId: z.string().min(1, "Please select a doctor."),
  appointmentTime: z.string().min(1, "Please select a time slot."),
  appointmentDate: z.string().min(1, "Date is required."),
  notes: z.string().optional(),
});

// --- Zod Schema for anonymous users ---
const anonymousAppointmentSchema = authenticatedAppointmentSchema.extend({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Valid email is required."),
});

type AppointmentFormData = z.infer<typeof anonymousAppointmentSchema>;

export const CreateAppointmentForm = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  // State for data fetched from API
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);

  // State for UI feedback
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(isAuthenticated ? authenticatedAppointmentSchema : anonymousAppointmentSchema),
    defaultValues: {
      specialization: '',
      doctorId: '',
      appointmentTime: '',
      appointmentDate: new Date().toISOString().split('T')[0],
      notes: '',
      fullName: '',
      email: '',
    },
  });

  const selectedSpecialization = form.watch('specialization');
  const selectedDoctorId = form.watch('doctorId');
  const selectedDate = form.watch('appointmentDate');

  // Load specializations on mount
  useEffect(() => {
    getSpecializations()
      .then(response => setSpecializations(response.data))
      .catch(() => setApiError("Could not load specializations."));
  }, []);

  // Load doctors when specialization changes
  useEffect(() => {
    if (selectedSpecialization) {
      form.setValue('doctorId', '');
      setDoctors([]);
      getDoctorsBySpecialization(selectedSpecialization)
        .then(response => setDoctors(response.data))
        .catch(() => setApiError("Could not find doctors for this specialty."));
    }
  }, [selectedSpecialization]);

  // Load schedule when doctor or date changes
  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      form.setValue('appointmentTime', '');
      setSchedule([]);
      getDoctorSchedule(selectedDoctorId, selectedDate)
        .then(response => setSchedule(response.data))
        .catch(() => setApiError("Could not load the doctor's schedule."));
    }
  }, [selectedDoctorId, selectedDate]);
  
  const onSubmit = async (data: AppointmentFormData) => {
    setApiError(null);
    setIsSubmitting(true);
    
    try {
      const appointmentData: any = {
        doctorId: data.doctorId,
        appointmentTime: data.appointmentTime,
        notes: data.notes,
      };

      // Add name and email for anonymous users
      if (!isAuthenticated) {
        appointmentData.fullName = data.fullName;
        appointmentData.email = data.email;
      }

      await createAppointment(appointmentData);
      
      if (isAuthenticated) {
        router.push('/appointments');
      } else {
        // Show success message for anonymous users
        alert('Appointment booked successfully! You will receive a confirmation email.');
        form.reset();
        setDoctors([]);
        setSchedule([]);
      }
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'An error occurred during booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Your Appointment</CardTitle>
        <CardDescription>
          {isAuthenticated 
            ? "Follow the steps below to schedule your visit." 
            : "Book an appointment without creating an account."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* --- Step 1: Specialization --- */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">1. Select Medical Specialization</Label>
            <Controller
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.specialization && (
              <p className="text-red-500 text-sm">{form.formState.errors.specialization.message}</p>
            )}
          </div>

          {/* --- Step 2: Doctor Selection --- */}
          {doctors.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">2. Choose Your Doctor</Label>
              <Controller
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map(doc => (
                        <SelectItem key={doc.id} value={doc.id}>{doc.full_Name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.doctorId && (
                <p className="text-red-500 text-sm">{form.formState.errors.doctorId.message}</p>
              )}
            </div>
          )}

          {/* --- Step 3: Date & Time Selection --- */}
          {selectedDoctorId && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">3. Select Appointment Date</Label>
                <Input 
                  type="date" 
                  {...form.register('appointmentDate')}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              {schedule.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Available Time Slots</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {schedule.filter(s => s.isAvailable).map(slot => (
                      <Button 
                        key={slot.start} 
                        type="button"
                        variant={form.getValues('appointmentTime') === slot.start ? 'default' : 'outline'}
                        onClick={() => form.setValue('appointmentTime', slot.start, { shouldValidate: true })}
                        className="w-full"
                      >
                        {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Button>
                    ))}
                  </div>
                  {form.formState.errors.appointmentTime && (
                    <p className="text-red-500 text-sm">{form.formState.errors.appointmentTime.message}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- Step 4: Personal Details (for anonymous users only) --- */}
          {!isAuthenticated && form.getValues('appointmentTime') && (
            <div className="space-y-4 pt-4 border-t">
              <Label className="text-base font-semibold">4. Your Contact Information</Label>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input 
                  id="fullName"
                  placeholder="John Doe"
                  {...form.register('fullName')}
                />
                {form.formState.errors.fullName && (
                  <p className="text-red-500 text-sm">{form.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
          )}

          {/* --- Step 5: Notes & Submission --- */}
          {form.getValues('appointmentTime') && (isAuthenticated || (form.getValues('fullName') && form.getValues('email'))) && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="notes">{isAuthenticated ? '4' : '5'}. Additional Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any specific concerns or information for the doctor..."
                  rows={3}
                  {...form.register('notes')} 
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Booking Appointment...' : 'Confirm Appointment'}
              </Button>

              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground text-center">
                  Want to manage your appointments? <a href="/register" className="text-primary hover:underline">Create an account</a>
                </p>
              )}
            </div>
          )}
          
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p className="text-sm">{apiError}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};