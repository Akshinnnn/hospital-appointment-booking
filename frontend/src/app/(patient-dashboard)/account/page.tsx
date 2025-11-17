import { AccountForm } from '@/components/account/AccountForm';
import React from 'react';

export default function MyAccountPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Account Details</h1>
          <p className="text-muted-foreground text-lg">
            View and manage your profile information
          </p>
        </header>
        
        <AccountForm />
      </div>
    </div>
  );
}