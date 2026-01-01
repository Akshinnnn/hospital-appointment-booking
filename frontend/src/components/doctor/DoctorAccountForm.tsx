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
import { useToast } from "@/components/ui/toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle } from "lucide-react";

interface DoctorAccount {
  full_Name: string;
  email: string;
  phone_Number?: string;
  specialisation?: string;
}

const doctorAccountSchema = z.object({
  full_Name: z.string().min(2, "Name must be at least 2 characters."),
  phone_Number: z.string().optional(),
  specialisation: z.string().optional(),
});

type DoctorAccountFormData = z.infer<typeof doctorAccountSchema>;

export const DoctorAccountForm = () => {
  const { update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [account, setAccount] = useState<DoctorAccount | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success: showSuccess, error: showError } = useToast();

  const form = useForm<DoctorAccountFormData>({
    resolver: zodResolver(doctorAccountSchema),
  });

  useEffect(() => {
    setIsLoading(true);
    getAccountDetails()
      .then(response => {
        // Response interceptor already unwraps ApiResponse, but handle both cases
        const user: DoctorAccount = response.data?.data || response.data;
        setAccount(user);
        form.reset({
          full_Name: user.full_Name,
          phone_Number: user.phone_Number || '',
          specialisation: user.specialisation || '',
        });
      })
      .catch(() => {
        setApiError('Could not load your account details.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [form]);

  const onSubmit = async (data: DoctorAccountFormData) => {
    setApiError(null);
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
      
      showSuccess('Your profile has been updated!');
      setIsEditing(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred.';
      setApiError(errorMessage);
      showError(errorMessage);
    }
  };

  // Loading skeletons
  if (isLoading || !account) {
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

              {/* --- Specialization (read-only, displayed for doctors) --- */}
              <FormItem>
                <FormLabel>Specialization</FormLabel>
                <FormControl>
                  <Input readOnly disabled value={account.specialisation || "Not specified"} />
                </FormControl>
              </FormItem>
              
              <div className="flex gap-4">
                <Button type="submit" disabled={form.formState.isSubmitting} className="gap-2">
                  {form.formState.isSubmitting && <LoadingSpinner size="sm" />}
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>

              {apiError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {apiError}
                </div>
              )}
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
            <div className="space-y-2 pb-4 border-b">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Phone Number</label>
              <p className="text-xl font-semibold">{account.phone_Number || "Not provided"}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Specialization</label>
              <p className="text-xl font-semibold">{account.specialisation || "Not specified"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

