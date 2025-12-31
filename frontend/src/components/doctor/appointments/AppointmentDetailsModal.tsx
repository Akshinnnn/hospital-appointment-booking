'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Appointment } from '@/types/api';
import { Calendar, User, Mail, Clock, FileText, Hash } from 'lucide-react';

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentDetailsModal({ appointment, isOpen, onClose }: AppointmentDetailsModalProps) {
  if (!appointment) return null;

  const appointmentDate = new Date(appointment.appointmentTime);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">Appointment Details</AlertDialogTitle>
          <AlertDialogDescription>
            Complete information about this appointment
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* Patient Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </h3>
            <div className="grid gap-3 pl-7">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Full Name:</span>
                <p className="text-base">{appointment.fullName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                <p className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {appointment.email}
                </p>
              </div>
              {appointment.patientId && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Patient ID:</span>
                  <p className="text-base font-mono text-xs">{appointment.patientId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Information
            </h3>
            <div className="grid gap-3 pl-7">
              {appointment.appointmentNumber && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Appointment Number:
                  </span>
                  <p className="text-base font-mono">{appointment.appointmentNumber}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date:
                </span>
                <p className="text-base">
                  {appointmentDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time:
                </span>
                <p className="text-base">
                  {appointmentDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <p className={`text-base font-medium ${
                  appointment.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {appointment.status}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </h3>
              <div className="pl-7">
                <p className="text-base text-muted-foreground whitespace-pre-wrap">{appointment.notes}</p>
              </div>
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

