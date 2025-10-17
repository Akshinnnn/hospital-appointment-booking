import { CreateAppointmentForm } from '@/components/forms/CreateAppointmentForm';
import React from 'react';

export default function BookAppointmentPage() {
  return (
    <section className="p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Book an Appointment</h1>
        <p className="text-gray-600">Follow the steps below to schedule your visit.</p>
      </header>
      
      <div className="max-w-2xl">
        <CreateAppointmentForm />
      </div>
    </section>
  );
}