'use client';

import React, { useState, useEffect } from 'react';
import { getMyAppointments } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Appointment } from '@/types/api';
import { User } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email: string;
}

interface PatientSelectorProps {
  value?: string;
  onValueChange: (patientId: string) => void;
  disabled?: boolean;
}

export function PatientSelector({ value, onValueChange, disabled }: PatientSelectorProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch appointments to get unique patients
    getMyAppointments()
      .then(response => {
        const appointments: Appointment[] = response.data?.data || response.data || [];
        const uniquePatients = new Map<string, Patient>();

        // Extract unique patients from appointments
        appointments.forEach(appt => {
          if (appt.patientId && appt.fullName && appt.email) {
            if (!uniquePatients.has(appt.patientId)) {
              uniquePatients.set(appt.patientId, {
                id: appt.patientId,
                name: appt.fullName,
                email: appt.email,
              });
            }
          }
        });

        setPatients(Array.from(uniquePatients.values()));
      })
      .catch(() => {
        // If fetching fails, keep empty list
        setPatients([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Patient</label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading patients..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <User className="h-4 w-4" />
        Patient
      </label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Select a patient" />
        </SelectTrigger>
        <SelectContent>
          {patients.length > 0 ? (
            patients.map(patient => (
              <SelectItem key={patient.id} value={patient.id}>
                <div className="flex flex-col">
                  <span>{patient.name}</span>
                  <span className="text-xs text-muted-foreground">{patient.email}</span>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No patients found
            </div>
          )}
        </SelectContent>
      </Select>
      {patients.length === 0 && (
        <p className="text-xs text-muted-foreground">
          You need to have appointments with patients before you can upload medical records.
        </p>
      )}
    </div>
  );
}

