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
  email?: string;
  specialisation?: string;
}

interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
}

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Zod Schema for authenticated users ---
const authenticatedAppointmentSchema = z.object({
  specialization: z.string().min(1, "Specialization is required."),
  doctorId: z.string().min(1, "Please select a doctor."),
  appointmentTime: z.string().min(1, "Please select a time slot."),
  appointmentDate: z.string()
    .min(1, "Date is required.")
    .refine((date) => {
      const today = getTodayDateString();
      return date >= today;
    }, {
      message: "Appointment date cannot be in the past. Please select today or a future date.",
    }),
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
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<any>({
    resolver: zodResolver(isAuthenticated ? authenticatedAppointmentSchema : anonymousAppointmentSchema),
    defaultValues: {
      specialization: '',
      doctorId: '',
      appointmentTime: '',
      appointmentDate: getTodayDateString(),
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
      .then(response => {
        // Specializations endpoint returns List<string> directly (not wrapped in ApiResponse)
        const specs = response.data || [];
        setSpecializations(Array.isArray(specs) ? specs : []);
      })
      .catch(() => setApiError("Could not load specializations."));
  }, []);

  // Load doctors when specialization changes
  useEffect(() => {
    if (selectedSpecialization) {
      form.setValue('doctorId', '');
      setDoctors([]);
      setApiError(null);
      setInfoMessage(null);
      getDoctorsBySpecialization(selectedSpecialization)
        .then(response => {
          // Doctor endpoint returns List<User> directly (not wrapped in ApiResponse)
          const doctors = response.data || [];
          setDoctors(Array.isArray(doctors) ? doctors : []);
        })
        .catch(() => setApiError("Could not find doctors for this specialty."));
    }
  }, [selectedSpecialization]);

  // Load schedule when doctor or date changes
  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      form.setValue('appointmentTime', '');
      setSchedule([]);
      setApiError(null);
      setInfoMessage(null);
      
      console.log('Fetching schedule for:', { doctorId: selectedDoctorId, date: selectedDate });
      
      getDoctorSchedule(selectedDoctorId, selectedDate)
        .then(response => {
          console.log('Full schedule response:', response);
          console.log('Schedule response.data type:', typeof response.data, 'isArray:', Array.isArray(response.data));
          console.log('Schedule response.data:', response.data);
          
          // Schedule endpoint returns List<TimeSlotDTO> directly (not wrapped in ApiResponse)
          const schedule = response.data || [];
          console.log('Parsed schedule:', schedule, 'isArray:', Array.isArray(schedule));
          
          // Log each slot's availability status
          if (Array.isArray(schedule) && schedule.length > 0) {
            console.log('Sample slot:', schedule[0]);
            console.log('Available slots:', schedule.filter(s => s.isAvailable === true).length);
            console.log('Unavailable slots:', schedule.filter(s => s.isAvailable === false).length);
          }
          
          setSchedule(Array.isArray(schedule) ? schedule : []);
          
          if (schedule.length === 0) {
            setInfoMessage("No available slots for this date. Please select another date.");
          }
        })
        .catch((error) => {
          console.error('Schedule fetch error:', error);
          if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
            const errorMsg = error.response?.data?.message || error.response?.data || "Could not load the doctor's schedule.";
            setApiError(typeof errorMsg === 'string' ? errorMsg : "Could not load the doctor's schedule.");
          } else if (error.request) {
            console.error('No response received:', error.request);
            setApiError("Network error: Could not reach the server.");
          } else {
            console.error('Error setting up request:', error.message);
            setApiError("Request error: " + error.message);
          }
        });
    }
  }, [selectedDoctorId, selectedDate]);
  
  const onSubmit = async (data: AppointmentFormData) => {
    setApiError(null);
    setInfoMessage(null);
    setIsSubmitting(true);
    
    try {
      const appointmentData: any = {
        doctorId: data.doctorId,
        appointmentTime: data.appointmentTime,
        notes: data.notes,
      };

      // Add name and email - required by backend
      if (isAuthenticated) {
        // Get from session for authenticated users
        appointmentData.fullName = session?.user?.name || 'User';
        appointmentData.email = session?.user?.email || '';
      } else {
        // Get from form for anonymous users
        appointmentData.fullName = data.fullName;
        appointmentData.email = data.email;
      }

      const response = await createAppointment(appointmentData);
      
      // Response interceptor already unwraps ApiResponse, but handle both cases
      const appointment = response.data?.data || response.data;
      
      // Refresh the schedule to reflect that the slot is no longer available
      if (selectedDoctorId && selectedDate) {
        try {
          const scheduleResponse = await getDoctorSchedule(selectedDoctorId, selectedDate);
          const updatedSchedule = scheduleResponse.data || [];
          setSchedule(Array.isArray(updatedSchedule) ? updatedSchedule : []);
        } catch (error) {
          console.error('Failed to refresh schedule:', error);
          // Continue with success flow even if refresh fails
        }
      }
      
      if (isAuthenticated) {
        // Redirect to appointments page for authenticated users
        alert('Appointment booked successfully! Redirecting to your appointments...');
        router.push('/appointments');
      } else {
        // Show success message for anonymous users
        alert('Appointment booked successfully! You will receive a confirmation email at ' + data.email);
        form.reset();
        setSpecializations([]);
        setDoctors([]);
        setSchedule([]);
      }
    } catch (error: any) {
      // Handle ApiResponse error structure
      const errorMessage = error.response?.data?.message || error.response?.data?.Message || 'An error occurred during booking.';
      setApiError(errorMessage);
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
              <p className="text-red-500 text-sm">{String(form.formState.errors.specialization.message)}</p>
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
                <p className="text-red-500 text-sm">{String(form.formState.errors.doctorId.message)}</p>
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
                  min={getTodayDateString()}
                />
                {form.formState.errors.appointmentDate && (
                  <p className="text-red-500 text-sm">{String(form.formState.errors.appointmentDate.message)}</p>
                )}
              </div>
              
              {schedule.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Time Slots</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {schedule.map(slot => {
                      // Explicitly check isAvailable - ensure it's a boolean true
                      const isAvailable = Boolean(slot.isAvailable) === true;
                      const isSelected = form.getValues('appointmentTime') === slot.start;
                      
                      return (
                        <button
                          key={slot.start} 
                          type="button"
                          onClick={(e) => {
                            if (!isAvailable) {
                              e.preventDefault();
                              e.stopPropagation();
                              return;
                            }
                            e.preventDefault();
                            e.stopPropagation();
                            form.setValue('appointmentTime', slot.start, { shouldValidate: true });
                          }}
                          disabled={!isAvailable}
                          tabIndex={isAvailable ? 0 : -1}
                          className={`
                            w-full px-4 py-2 rounded-md text-sm font-medium transition-all
                            ${isAvailable 
                              ? isSelected
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-md' 
                                : 'bg-background border-2 border-input hover:bg-accent hover:text-accent-foreground cursor-pointer'
                              : 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed opacity-50 pointer-events-none'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                          title={isAvailable ? 'Click to select this time' : 'This time slot is not available'}
                        >
                          {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="opacity-50">Grayed out slots</span> are not available for booking
                  </p>
                  {form.formState.errors.appointmentTime && (
                    <p className="text-red-500 text-sm">{String(form.formState.errors.appointmentTime.message)}</p>
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
                  <p className="text-red-500 text-sm">{String(form.formState.errors.fullName.message)}</p>
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
                  <p className="text-red-500 text-sm">{String(form.formState.errors.email.message)}</p>
                )}
              </div>
            </div>
          )}

          {/* --- Step 4/5: Notes & Submission --- */}
          {selectedDoctorId && selectedDate && form.getValues('appointmentTime') && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-semibold">
                  {isAuthenticated ? '4' : '5'}. Additional Notes (Optional)
                </Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any specific concerns or information for the doctor..."
                  rows={3}
                  {...form.register('notes')} 
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || (!isAuthenticated && (!form.getValues('fullName') || !form.getValues('email')))}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Booking Appointment...' : '✓ Confirm Appointment'}
              </Button>

              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground text-center">
                  Want to manage your appointments? <a href="/register" className="text-primary hover:underline">Create an account</a>
                </p>
              )}
            </div>
          )}
          
          {infoMessage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
              <p className="text-sm">{infoMessage}</p>
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