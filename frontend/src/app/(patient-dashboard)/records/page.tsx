import { RecordList } from '@/components/records/RecordList';
import React from 'react';

export default function MyRecordsPage() {
  return (
    <section className="container max-w-4xl pl-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Medical Records</h1>
        <p className="text-muted-foreground">
          View your medical history and notes from your doctors.
        </p>
      </header>
      
      <RecordList />
    </section>
  );
}