'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { registerUser } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const registerSchema = z.object({
  full_Name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  phone_Number: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const router = useRouter();
  const [apiError, setApiError] = React.useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_Name: '',
      email: '',
      phone_Number: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      await registerUser(data);

      const signInResponse = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResponse?.ok) {
        router.push('/');
      } else {
        setApiError(signInResponse?.error || 'Failed to log in after registration.');
      }
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'An error occurred during registration.');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Enter your details to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="Your full name" {...field} autoComplete='name' /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="your@email.com" {...field} autoComplete='email' /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_Number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl><Input placeholder="Your phone number" {...field} autoComplete='tel' /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} autoComplete='new-password' /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            {apiError && <p className="text-sm text-red-500 text-center">{apiError}</p>}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};