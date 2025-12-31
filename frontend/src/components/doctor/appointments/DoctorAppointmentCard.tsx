'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types/api';
import { Calendar, User, Mail, Clock, Eye, FileText } from 'lucide-react';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';

interface DoctorAppointmentCardProps {
  appointment: Appointment;
  onViewDetails: (appointment: Appointment) => void;
}

export function DoctorAppointmentCard({ appointment, onViewDetails }: DoctorAppointmentCardProps) {
  const appointmentDate = new Date(appointment.appointmentTime);
  const isUpcoming = appointmentDate > new Date();
  const isToday = appointmentDate.toDateString() === new Date().toDateString();

  const statusColors = {
    APPROVED: 'text-green-600 bg-green-50 dark:bg-green-950',
    CANCELLED: 'text-red-600 bg-red-50 dark:bg-red-950',
  };

  return (
    <Card className={`${isToday ? 'border-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              {appointment.fullName}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {appointment.email}
              </span>
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
            <div className="text-xs text-muted-foreground">
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
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(appointment)}
          className="w-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

