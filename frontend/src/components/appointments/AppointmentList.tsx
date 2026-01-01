'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getMyAppointments, cancelAppointment } from '@/lib/api';
import { PatientAppointmentCard } from './PatientAppointmentCard';
import { PatientAppointmentDetailsModal } from './PatientAppointmentDetailsModal';
import { Appointment, AppointmentStatus } from '@/types/api';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useToast } from '@/components/ui/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AppointmentList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { success: showSuccess, error: showError } = useToast();

  const fetchAppointments = () => {
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
        (a.doctorName?.toLowerCase().includes(query)) ||
        (a.specialization?.toLowerCase().includes(query)) ||
        (a.appointmentNumber?.toLowerCase().includes(query))
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

  const handleCancel = async (appointment: Appointment) => {
    try {
      await cancelAppointment(appointment.id);
      showSuccess('Appointment cancelled successfully!');
      fetchAppointments();
      setIsModalOpen(false);
      setSelectedAppointment(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel appointment. Please try again.';
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12 gap-2">
          <LoadingSpinner />
          <span className="text-muted-foreground">Loading your appointments...</span>
        </div>
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
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter and search your appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by doctor, specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AppointmentStatus | 'ALL')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Tabs */}
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
                <PatientAppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onViewDetails={handleViewDetails}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No upcoming appointments"
              description={
                searchQuery || statusFilter !== 'ALL' || dateFilter !== 'all'
                  ? "No appointments match your filters. Try adjusting your search criteria."
                  : "You don't have any upcoming appointments scheduled. Book your first appointment to get started."
              }
            />
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastAppointments.map(appointment => (
                <PatientAppointmentCard
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
              description={
                searchQuery || statusFilter !== 'ALL' || dateFilter !== 'all'
                  ? "No appointments match your filters. Try adjusting your search criteria."
                  : "You don't have any past appointments in your records."
              }
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Appointment Details Modal */}
      <PatientAppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCancel={handleCancel}
      />
    </div>
  );
};
