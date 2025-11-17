'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { getAccountDetails, updateAccountDetails } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";


interface UserAccount {
  full_Name: string;
  email: string;
  phone_Number?: string;
}

const accountSchema = z.object({
  full_Name: z.string().min(2, "Name must be at least 2 characters."),
  phone_Number: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

export const AccountForm = () => {
  const { update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
  });

  useEffect(() => {
    getAccountDetails()
      .then(response => {
        // Response interceptor already unwraps ApiResponse, but handle both cases
        const user: UserAccount = response.data?.data || response.data;
        setAccount(user);
        form.reset({
          full_Name: user.full_Name,
          phone_Number: user.phone_Number || '',
        });
      })
      .catch(() => {
        setApiError('Could not load your account details.');
      });
  }, [form]);

  const onSubmit = async (data: AccountFormData) => {
    setApiError(null);
    setSuccessMessage(null);
    try {
      await updateAccountDetails({
        full_Name: data.full_Name,
        phone_Number: data.phone_Number,
        email: account?.email
      });
      setAccount(prev => prev ? { ...prev, ...data } : null);
      
      // Update the NextAuth session to reflect the new name in the navbar
      await update({
        ...data,
        name: data.full_Name
      });
      
      setSuccessMessage('Your profile has been updated!');
      setIsEditing(false);
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'An error occurred.');
    }
  };

  // loading skeletons
  if (!account) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1.5">
          <CardTitle className="text-2xl">Profile Details</CardTitle>
          <CardDescription className="text-base">
            {isEditing ? "Make changes to your profile." : "View your personal information."}
          </CardDescription>
        </div>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {isEditing ? (
          // --- EDITING MODE ---
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* --- Full Name (EDITABLE) --- */}
              <FormField
                control={form.control}
                name="full_Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- Email (read-only) --- */}
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input readOnly disabled value={account.email} />
                </FormControl>
              </FormItem>

              {/* --- Phone Number (editable) --- */}
              <FormField
                control={form.control}
                name="phone_Number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>

              {apiError && <p className="text-sm text-red-500">{apiError}</p>}
              {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
            </form>
          </Form>
        ) : (
          // --- VIEWING MODE ---
          <div className="space-y-6">
            <div className="space-y-2 pb-4 border-b">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Full Name</label>
              <p className="text-xl font-semibold">{account.full_Name}</p>
            </div>
            <div className="space-y-2 pb-4 border-b">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Email Address</label>
              <p className="text-xl font-semibold">{account.email}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Phone Number</label>
              <p className="text-xl font-semibold">{account.phone_Number || "Not provided"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};