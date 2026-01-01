'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types/api';
import { Calendar, Stethoscope, Clock, Eye, FileText, X } from 'lucide-react';

interface PatientAppointmentCardProps {
  appointment: Appointment;
  onViewDetails: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
}

export function PatientAppointmentCard({ appointment, onViewDetails, onCancel }: PatientAppointmentCardProps) {
  const appointmentDate = new Date(appointment.appointmentTime);
  const isUpcoming = appointmentDate > new Date();
  const isToday = appointmentDate.toDateString() === new Date().toDateString();

  const statusColors = {
    APPROVED: 'text-green-600 bg-green-50 dark:bg-green-950',
    CANCELLED: 'text-red-600 bg-red-50 dark:bg-red-950',
  };

  const doctorName = appointment.doctorName ? `Dr. ${appointment.doctorName}` : 'Unknown Doctor';

  return (
    <Card className={`${isToday ? 'border-primary shadow-md' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              {doctorName}
            </CardTitle>
            <CardDescription className="mt-1">
              {appointment.specialization || 'General Practice'}
            </CardDescription>
          </div>
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColors[appointment.status]}`}>
            {appointment.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {appointmentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {appointmentDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {isUpcoming && (
              <span className="text-xs text-muted-foreground">
                ({Math.round((appointmentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60))} hours away)
              </span>
            )}
          </div>
          {appointment.appointmentNumber && (
            <div className="text-xs text-muted-foreground font-mono">
              Appointment #: {appointment.appointmentNumber}
            </div>
          )}
          {appointment.notes && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-muted-foreground line-clamp-2">{appointment.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(appointment)}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
        {isUpcoming && appointment.status === 'APPROVED' && onCancel && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onCancel(appointment)}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

