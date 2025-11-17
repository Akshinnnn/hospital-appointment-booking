import { RecordList } from '@/components/records/RecordList';
import React from 'react';

export default function MyRecordsPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground text-lg">
            View your medical history and notes from your doctors
          </p>
        </header>
        
        <RecordList />
      </div>
    </div>
  );
}