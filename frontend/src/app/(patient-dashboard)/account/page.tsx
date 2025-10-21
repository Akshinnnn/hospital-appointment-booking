import { AccountForm } from '@/components/account/AccountForm';
import React from 'react';

export default function MyAccountPage() {
  return (
    <section className="container max-w-2xl pl-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Account Details</h1>
        <p className="text-muted-foreground">
          View and manage your profile details.
        </p>
      </header>
      
      <AccountForm />
    </section>
  );
}