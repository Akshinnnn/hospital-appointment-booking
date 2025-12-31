'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getMyAppointments, cancelAppointment } from '@/lib/api';
import { DoctorAppointmentCard } from './DoctorAppointmentCard';
import { AppointmentFilters } from './AppointmentFilters';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';
import { Appointment, AppointmentStatus } from '@/types/api';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';

export function DoctorAppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAppointments = () => {
    setIsLoading(true);
    setError(null);
    getMyAppointments()
      .then(response => {
        // Response interceptor already unwraps ApiResponse, but handle both cases
        const appointmentsData = response.data?.data || response.data || [];
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      })
      .catch(() => {
        setError('Could not fetch your appointments.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    // Date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(a => {
          const appointmentDate = new Date(a.appointmentTime);
          return appointmentDate.toDateString() === today.toDateString();
        });
        break;
      case 'upcoming':
        filtered = filtered.filter(a => new Date(a.appointmentTime) > now);
        break;
      case 'past':
        filtered = filtered.filter(a => new Date(a.appointmentTime) <= now);
        break;
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.fullName.toLowerCase().includes(query) ||
        a.email.toLowerCase().includes(query) ||
        a.appointmentNumber?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [appointments, statusFilter, dateFilter, searchQuery]);

  // Group appointments
  const upcomingAppointments = filteredAppointments
    .filter(a => new Date(a.appointmentTime) > new Date())
    .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime());

  const pastAppointments = filteredAppointments
    .filter(a => new Date(a.appointmentTime) <= new Date())
    .sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime());

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={fetchAppointments}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AppointmentFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingAppointments.map(appointment => (
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
              description="You don't have any upcoming appointments at the moment."
            />
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastAppointments.map(appointment => (
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
              title="No past appointments"
              description="You don't have any past appointments in your records."
            />
          )}
        </TabsContent>
      </Tabs>

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

