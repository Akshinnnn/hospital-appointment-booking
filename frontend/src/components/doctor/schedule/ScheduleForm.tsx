'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createSchedule, updateSchedule } from '@/lib/api';
import { DoctorSchedule } from '@/types/api';
import { useToast } from '@/components/ui/toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const STORAGE_KEY = 'doctor_schedules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Plus, Edit, AlertCircle } from 'lucide-react';

const scheduleSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
}).refine(
  (data) => {
    if (!data.date || !data.startTime || !data.endTime) return true;
    const start = new Date(`${data.date}T${data.startTime}`);
    const end = new Date(`${data.date}T${data.endTime}`);
    return start < end;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleFormProps {
  scheduleId?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onScheduleCreated?: (schedule: DoctorSchedule) => void;
}

export function ScheduleForm({ 
  scheduleId, 
  initialStartTime, 
  initialEndTime,
  onSuccess,
  onCancel,
  onScheduleCreated
}: ScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success: showSuccess, error: showError } = useToast();

  const isEditMode = !!scheduleId;

  // Parse initial values if editing
  const getInitialDate = () => {
    if (initialStartTime) {
      const date = new Date(initialStartTime);
      return date.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  const getInitialStartTime = () => {
    if (initialStartTime) {
      const date = new Date(initialStartTime);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '09:00';
  };

  const getInitialEndTime = () => {
    if (initialEndTime) {
      const date = new Date(initialEndTime);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '17:00';
  };

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      date: getInitialDate(),
      startTime: getInitialStartTime(),
      endTime: getInitialEndTime(),
    },
  });

  const onSubmit = async (data: ScheduleFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Combine date and time into full datetime
      const startDateTime = new Date(`${data.date}T${data.startTime}`);
      const endDateTime = new Date(`${data.date}T${data.endTime}`);

      if (isEditMode && scheduleId) {
        // Update existing schedule
        await updateSchedule(scheduleId, startDateTime, endDateTime);
        showSuccess('Schedule updated successfully!');
        
        // Update in localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const schedules: DoctorSchedule[] = JSON.parse(stored);
            const updatedSchedules = schedules.map(s => 
              s.id === scheduleId 
                ? { ...s, start_Time: startDateTime.toISOString(), end_Time: endDateTime.toISOString() }
                : s
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSchedules));
          }
        } catch (err) {
          console.error('Failed to update schedule in localStorage:', err);
        }
      } else {
        // Create new schedule
        const response = await createSchedule(startDateTime, endDateTime);
        
        // Response interceptor unwraps data, but handle both cases
        const schedule = response.data?.data || response.data;
        
        showSuccess('Schedule created successfully!');
        
        // Notify parent component about the created schedule
        if (onScheduleCreated && schedule) {
          // Ensure schedule has the required fields
          const newSchedule: DoctorSchedule = {
            id: schedule.id || schedule.Id || '',
            doctor_Id: schedule.doctor_Id || schedule.Doctor_Id || '',
            start_Time: schedule.start_Time || schedule.Start_Time || startDateTime.toISOString(),
            end_Time: schedule.end_Time || schedule.End_Time || endDateTime.toISOString(),
          };
          onScheduleCreated(newSchedule);
        }
        
        // Reset form after successful creation
        form.reset({
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '17:00',
        });
      }

      // Call success callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while saving the schedule.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Edit className="h-5 w-5" />
              Edit Schedule
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Create New Schedule
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? 'Update the schedule time and date.'
            : 'Set your availability by creating a schedule block.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <LoadingSpinner size="sm" />}
                {isSubmitting
                  ? isEditMode
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditMode
                    ? 'Update Schedule'
                    : 'Create Schedule'}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

