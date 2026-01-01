'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, User, TrendingUp, Activity, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getMyAppointments, getMyRecords } from '@/lib/api';
import { Appointment, MedicalRecord, AppointmentStatus } from '@/types/api';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';
import { EmptyState } from '@/components/ui/empty-state';
import { useSession } from 'next-auth/react';

export function PatientDashboardPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointments and records
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    Promise.all([
      getMyAppointments()
        .then(response => {
          const appointmentsData = response.data?.data || response.data || [];
          return Array.isArray(appointmentsData) ? appointmentsData : [];
        })
        .catch(() => {
          console.error('Failed to fetch appointments');
          return [];
        }),
      getMyRecords()
        .then(response => {
          const recordsData = (response.data as any)?.data || response.data || [];
          return Array.isArray(recordsData) ? recordsData : [];
        })
        .catch(() => {
          console.error('Failed to fetch records');
          return [];
        })
    ])
      .then(([appointmentsData, recordsData]) => {
        setAppointments(appointmentsData);
        setRecords(recordsData);
      })
      .catch(() => {
        setError('Could not load your dashboard data.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalAppointments = appointments.length;
    const upcomingAppointments = appointments.filter(
      a => new Date(a.appointmentTime) > now && a.status === 'APPROVED'
    );
    const todayAppointments = appointments.filter(a => {
      const appointmentDate = new Date(a.appointmentTime);
      return appointmentDate.toDateString() === today.toDateString() && a.status === 'APPROVED';
    });
    const totalRecords = records.length;

    return {
      total: totalAppointments,
      upcoming: upcomingAppointments.length,
      today: todayAppointments.length,
      records: totalRecords,
    };
  }, [appointments, records]);

  // Get recent appointments (upcoming, sorted by date)
  const recentAppointments = useMemo(() => {
    return appointments
      .filter(a => new Date(a.appointmentTime) > new Date() && a.status === 'APPROVED')
      .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime())
      .slice(0, 4);
  }, [appointments]);

  // Get recent records (sorted by creation date, newest first)
  const recentRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [records]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);

    Promise.all([
      getMyAppointments()
        .then(response => {
          const appointmentsData = response.data?.data || response.data || [];
          return Array.isArray(appointmentsData) ? appointmentsData : [];
        })
        .catch(() => []),
      getMyRecords()
        .then(response => {
          const recordsData = (response.data as any)?.data || response.data || [];
          return Array.isArray(recordsData) ? recordsData : [];
        })
        .catch(() => [])
    ])
      .then(([appointmentsData, recordsData]) => {
        setAppointments(appointmentsData);
        setRecords(recordsData);
        setError(null);
      })
      .catch(() => {
        setError('Could not load your dashboard data.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (error && appointments.length === 0 && records.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Welcome back! Manage your appointments and medical records.
          </p>
        </div>
        <ErrorDisplay
          error={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome{session?.user?.name ? `, ${session.user.name}` : ''}!
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Here's an overview of your appointments and medical records.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Appointments */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time appointments
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-primary">{stats.upcoming}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Scheduled appointments
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="relative overflow-hidden border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-primary">{stats.today}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Appointments scheduled today
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Medical Records */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats.records}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total records available
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
          <Link href="/book-appointment">
            <Plus className="h-5 w-5" />
            <span>Book Appointment</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
          <Link href="/appointments">
            <Calendar className="h-5 w-5" />
            <span>View Appointments</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
          <Link href="/records">
            <FileText className="h-5 w-5" />
            <span>View Records</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
          <Link href="/account">
            <User className="h-5 w-5" />
            <span>Account Settings</span>
          </Link>
        </Button>
      </div>

      {/* Recent Appointments */}
      {!isLoading && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
              <CardDescription>
                Your next scheduled appointments
              </CardDescription>
            </div>
            {recentAppointments.length > 0 && (
              <Button asChild variant="outline" size="sm">
                <Link href="/appointments">View All</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : recentAppointments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {recentAppointments.map(appointment => {
                  const appointmentDate = new Date(appointment.appointmentTime);
                  const isToday = appointmentDate.toDateString() === new Date().toDateString();
                  const doctorName = appointment.doctorName ? `Dr. ${appointment.doctorName}` : 'Unknown Doctor';

                  return (
                    <Card key={appointment.id} className={isToday ? 'border-primary' : ''}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{doctorName}</CardTitle>
                            <CardDescription>
                              {appointment.specialization || 'General'}
                            </CardDescription>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            appointment.status === 'APPROVED' 
                              ? 'text-green-600 bg-green-50 dark:bg-green-950' 
                              : 'text-red-600 bg-red-50 dark:bg-red-950'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {appointmentDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span>
                              {appointmentDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {appointment.appointmentNumber && (
                            <div className="text-xs text-muted-foreground">
                              Appointment #: {appointment.appointmentNumber}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No upcoming appointments"
                description="You don't have any upcoming appointments scheduled. Book your first appointment to get started."
                action={
                  <Button asChild>
                    <Link href="/book-appointment">Book Appointment</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Records */}
      {!isLoading && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Recent Medical Records</CardTitle>
              <CardDescription>
                Your latest medical records and documents
              </CardDescription>
            </div>
            {recentRecords.length > 0 && (
              <Button asChild variant="outline" size="sm">
                <Link href="/records">View All</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : recentRecords.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {recentRecords.map(record => (
                  <Card key={record.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        {record.title || 'Medical Record'}
                      </CardTitle>
                      <CardDescription>
                        {new Date(record.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {record.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {record.description}
                        </p>
                      )}
                      {record.fileName && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          File: {record.fileName}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No medical records"
                description="Your medical records will appear here once they are available from your doctors."
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

