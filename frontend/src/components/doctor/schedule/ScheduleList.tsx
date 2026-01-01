'use client';

import React, { useState, useEffect } from 'react';
import { deleteSchedule, getScheduleById } from '@/lib/api';
import { ScheduleCard } from './ScheduleCard';
import { ScheduleForm } from './ScheduleForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DoctorSchedule } from '@/types/api';
import { Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';

const STORAGE_KEY = 'doctor_schedules';

interface ScheduleListProps {
  refreshTrigger?: number;
}

export function ScheduleList({ refreshTrigger }: ScheduleListProps = {}) {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<DoctorSchedule | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { success: showSuccess, error: showError } = useToast();

  // Load schedules from localStorage on mount and when refreshTrigger changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSchedules = JSON.parse(stored) as DoctorSchedule[];
        setSchedules(parsedSchedules);
      }
    } catch (err) {
      console.error('Failed to load schedules from localStorage:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshTrigger]);

  // Save schedules to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
      } catch (err) {
        console.error('Failed to save schedules to localStorage:', err);
      }
    }
  }, [schedules, isLoading]);

  const handleEdit = (schedule: DoctorSchedule) => {
    setEditingSchedule(schedule);
  };

  const handleEditCancel = () => {
    setEditingSchedule(null);
  };

  const handleEditSuccess = () => {
    setEditingSchedule(null);
    // Reload schedules from localStorage after edit
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSchedules = JSON.parse(stored) as DoctorSchedule[];
        setSchedules(parsedSchedules);
      }
    } catch (err) {
      console.error('Failed to reload schedules from localStorage:', err);
    }
    setError(null);
  };

  const handleDelete = async (scheduleId: string) => {
    setDeletingId(scheduleId);
    setError(null);

    try {
      await deleteSchedule(scheduleId);
      
      // Remove from local state
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      
      // Also remove from localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const schedules: DoctorSchedule[] = JSON.parse(stored);
          const filtered = schedules.filter(s => s.id !== scheduleId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
      } catch (err) {
        console.error('Failed to remove schedule from localStorage:', err);
      }
      
      showSuccess('Schedule deleted successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete schedule.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            My Schedules
          </CardTitle>
          <CardDescription>Loading your schedules...</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <LoadingSpinner />
            <span>Loading schedules...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (editingSchedule) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Schedule</CardTitle>
          <CardDescription>Update the schedule details</CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleForm
            scheduleId={editingSchedule.id}
            initialStartTime={editingSchedule.start_Time}
            initialEndTime={editingSchedule.end_Time}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          My Schedules
        </CardTitle>
        <CardDescription>
          View and manage your created schedules. {schedules.length === 0 && 'Create your first schedule to get started.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {schedules.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No schedules yet"
            description="Create a new schedule using the form above to get started."
          />
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === schedule.id}
              />
            ))}
          </div>
        )}

        <div className="mt-4 p-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
          <p className="font-medium mb-1">Note:</p>
          <p>
            Schedules are stored locally after creation. To view all schedules across devices,
            a backend endpoint to list all schedules would be needed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

