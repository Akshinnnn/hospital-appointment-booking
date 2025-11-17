'use client';

import React, { useState, useEffect } from 'react';
import { getMyAppointments, cancelAppointment } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Appointment {
  id: string;
  doctorId: string;
  appointmentTime: string;
  status: 'APPROVED' | 'CANCELLED';
  notes?: string;
  doctorName?: string;
  specialization?: string;
  appointmentNumber?: string;
  fullName?: string;
  email?: string;
}

const AppointmentCard = ({ appt, onCancel }: { appt: Appointment, onCancel: (id: string) => void }) => {
  const isUpcoming = new Date(appt.appointmentTime) > new Date();
  const doctorName = appt.doctorName ? `Dr. ${appt.doctorName}` : 'Unknown Doctor';
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Appointment with {doctorName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {new Date(appt.appointmentTime).toLocaleString(undefined, {
            dateStyle: 'full',
            timeStyle: 'short',
          })}
        </p>
        {appt.appointmentNumber && (
          <p className="text-xs text-muted-foreground">Appointment #: {appt.appointmentNumber}</p>
        )}
      </CardHeader>
      <CardContent>
        <p><span className="font-semibold">Specialization:</span> {appt.specialization || 'N/A'}</p>
        <p><span className="font-semibold">Status:</span> 
          <span className={`font-medium ${appt.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}`}>
            {appt.status}
          </span>
        </p>
        {appt.notes && <p className="mt-2"><span className="font-semibold">Notes:</span> {appt.notes}</p>}
      </CardContent>
      {isUpcoming && appt.status === 'APPROVED' && (
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Cancel Appointment</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently cancel your appointment.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Back</AlertDialogCancel>
                <AlertDialogAction onClick={() => onCancel(appt.id)} className="bg-red-600 hover:bg-red-700">
                  Yes, Cancel It
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
};

export const AppointmentList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = () => {
    setIsLoading(true);
    setError(null);
    getMyAppointments()
      .then(response => {
        // Response interceptor already unwraps ApiResponse, but handle both cases
        const appointments = response.data?.data || response.data || [];
        setAppointments(Array.isArray(appointments) ? appointments : []);
      })
      .catch(() => {
        setError('Could not fetch your appointments.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = (id: string) => {
    cancelAppointment(id)
      .then(() => {
        fetchAppointments();
      })
      .catch(() => {
        setError('Could not cancel the appointment. Please try again.');
      });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading your appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const upcomingAppointments = appointments
    .filter(a => a.status !== 'CANCELLED' && new Date(a.appointmentTime) > new Date())
    .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime());
    
  const pastAppointments = appointments
    .filter(a => a.status !== 'CANCELLED' && new Date(a.appointmentTime) <= new Date())
    .sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime());

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming" className="mt-6">
        <div className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appt => (
              <AppointmentCard key={appt.id} appt={appt} onCancel={handleCancel} />
            ))
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">You have no upcoming appointments.</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="past" className="mt-6">
        <div className="space-y-4">
          {pastAppointments.length > 0 ? (
            pastAppointments.map(appt => (
              <AppointmentCard key={appt.id} appt={appt} onCancel={handleCancel} />
            ))
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">You have no past appointments.</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};