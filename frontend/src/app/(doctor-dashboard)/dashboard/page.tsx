'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, FileText, User, Users, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getMyAppointments } from '@/lib/api';
import { Appointment, AppointmentStatus } from '@/types/api';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';
import { DoctorAppointmentCard } from '@/components/doctor/appointments/DoctorAppointmentCard';
import { AppointmentDetailsModal } from '@/components/doctor/appointments/AppointmentDetailsModal';
import { EmptyState } from '@/components/ui/empty-state';

const STORAGE_KEY = 'doctor_schedules';

export default function DoctorDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schedulesCount, setSchedulesCount] = useState(0);

  // Fetch appointments
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getMyAppointments()
      .then(response => {
        const appointmentsData = response.data?.data || response.data || [];
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      })
      .catch(() => {
        setError('Could not fetch your appointments.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Load schedules count from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const schedules = JSON.parse(stored);
        setSchedulesCount(Array.isArray(schedules) ? schedules.length : 0);
      }
    } catch (err) {
      console.error('Failed to load schedules from localStorage:', err);
    }
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
    const approvedAppointments = appointments.filter(a => a.status === 'APPROVED').length;
    const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED').length;

    return {
      total: totalAppointments,
      upcoming: upcomingAppointments.length,
      today: todayAppointments.length,
      approved: approvedAppointments,
      cancelled: cancelledAppointments,
    };
  }, [appointments]);

  // Get recent appointments (upcoming, sorted by date)
  const recentAppointments = useMemo(() => {
    return appointments
      .filter(a => new Date(a.appointmentTime) > new Date() && a.status === 'APPROVED')
      .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime())
      .slice(0, 6);
  }, [appointments]);

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  if (error && appointments.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Welcome to your doctor dashboard. Manage your schedule, appointments, and patient records.
          </p>
        </div>
        <ErrorDisplay
          error={error}
          onRetry={() => {
            setIsLoading(true);
            getMyAppointments()
              .then(response => {
                const appointmentsData = response.data?.data || response.data || [];
                setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
                setError(null);
              })
              .catch(() => {
                setError('Could not fetch your appointments.');
              })
              .finally(() => {
                setIsLoading(false);
              });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Welcome to your doctor dashboard. Manage your schedule, appointments, and patient records.
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

        {/* Active Schedules */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{schedulesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Availability schedules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
          <Link href="/schedule">
            <Clock className="h-5 w-5" />
            <span>Manage Schedule</span>
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
            <span>Medical Records</span>
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
                Your next scheduled appointments with patients
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : recentAppointments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentAppointments.map(appointment => (
                  <DoctorAppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No upcoming appointments"
                description="You don't have any upcoming appointments scheduled. Create a schedule to allow patients to book appointments."
                action={
                  <Button asChild>
                    <Link href="/schedule">Create Schedule</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
