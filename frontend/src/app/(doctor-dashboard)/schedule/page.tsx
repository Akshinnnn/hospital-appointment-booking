'use client';

import { ScheduleList } from '@/components/doctor/schedule/ScheduleList';
import { ScheduleForm } from '@/components/doctor/schedule/ScheduleForm';
import React, { useState, useCallback } from 'react';
import { DoctorSchedule } from '@/types/api';

const STORAGE_KEY = 'doctor_schedules';

export default function SchedulePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleScheduleCreated = useCallback((schedule: DoctorSchedule) => {
    // Add schedule to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const schedules: DoctorSchedule[] = stored ? JSON.parse(stored) : [];
      const exists = schedules.some(s => s.id === schedule.id);
      if (!exists) {
        schedules.push(schedule);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to save schedule to localStorage:', err);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Schedule Management</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Create and manage your availability schedules.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <ScheduleForm onScheduleCreated={handleScheduleCreated} />
        </div>
        <div className="order-1 lg:order-2">
          <ScheduleList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}

