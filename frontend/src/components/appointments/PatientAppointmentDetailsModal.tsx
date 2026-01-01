'use client';

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Appointment } from '@/types/api';
import { Calendar, Stethoscope, Clock, FileText, Hash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface PatientAppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: (appointment: Appointment) => void;
}

export function PatientAppointmentDetailsModal({ 
  appointment, 
  isOpen, 
  onClose,
  onCancel 
}: PatientAppointmentDetailsModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!appointment) return null;

  const appointmentDate = new Date(appointment.appointmentTime);
  const isUpcoming = appointmentDate > new Date();
  const doctorName = appointment.doctorName ? `Dr. ${appointment.doctorName}` : 'Unknown Doctor';

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    if (onCancel) {
      onCancel(appointment);
    }
    setShowCancelConfirm(false);
    onClose();
  };

  return (
    <>
      <AlertDialog open={isOpen && !showCancelConfirm} onOpenChange={onClose}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              Appointment Details
            </AlertDialogTitle>
            <AlertDialogDescription>
              Complete information about your appointment
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-6 py-4">
            {/* Doctor Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Doctor Information
              </h3>
              <div className="grid gap-3 pl-7">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Doctor Name:</span>
                  <p className="text-base font-semibold">{doctorName}</p>
                </div>
                {appointment.specialization && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Specialization:</span>
                    <p className="text-base">{appointment.specialization}</p>
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
                    <p className="text-base font-mono font-semibold">{appointment.appointmentNumber}</p>
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

          <AlertDialogFooter>
            {isUpcoming && appointment.status === 'APPROVED' && onCancel && (
              <Button
                variant="destructive"
                onClick={handleCancelClick}
                className="mr-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Appointment
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone. 
              The appointment will be permanently cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelConfirm(false)}>
              Keep Appointment
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

