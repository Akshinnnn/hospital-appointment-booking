import { AppointmentList } from '@/components/appointments/AppointmentList';
import React from 'react';

export default function MyAppointmentsPage() {
  return (
    <section className="container max-w-4xl pl-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <p className="text-muted-foreground">
          View your upcoming and past appointments.
        </p>
      </header>
      
      <AppointmentList />
    </section>
  );
}