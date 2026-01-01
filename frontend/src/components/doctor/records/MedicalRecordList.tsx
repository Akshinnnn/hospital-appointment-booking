'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getMyMedicalRecords, deleteMedicalRecord } from '@/lib/api';
import { getMyAppointments } from '@/lib/api';
import { MedicalRecordCard } from './MedicalRecordCard';
import { MedicalRecordForm } from './MedicalRecordForm';
import { MedicalRecordDetailsModal } from './MedicalRecordDetailsModal';
import { MedicalRecord, Appointment } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Search, Upload, AlertCircle, FileX } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';

export function MedicalRecordList() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  // Fetch patients from appointments
  useEffect(() => {
    getMyAppointments()
      .then(response => {
        const appointments: Appointment[] = response.data?.data || response.data || [];
        const patientMap = new Map<string, string>();
        
        appointments.forEach(appt => {
          if (appt.patientId && appt.fullName) {
            patientMap.set(appt.patientId, appt.fullName);
          }
        });
        
        setPatients(patientMap);
      })
      .catch(() => {
        // If fetching fails, continue without patient names
      });
  }, []);

  const fetchRecords = () => {
    setIsLoading(true);
    setError(null);
    getMyMedicalRecords()
      .then(response => {
        const recordsData = response.data?.data || response.data || [];
        setRecords(Array.isArray(recordsData) ? recordsData : []);
      })
      .catch(() => {
        setError('Could not fetch medical records.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filter records by patient name
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;

    const query = searchQuery.toLowerCase();
    return records.filter(record => {
      const patientName = patients.get(record.patient_Id)?.toLowerCase() || '';
      const title = record.title?.toLowerCase() || '';
      const description = record.description?.toLowerCase() || '';
      
      return patientName.includes(query) || 
             title.includes(query) || 
             description.includes(query);
    });
  }, [records, searchQuery, patients]);

  const handleView = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    fetchRecords(); // Refresh list after save
    showSuccess('Medical record updated successfully!');
  };

  const handleDelete = async (recordId: string) => {
    setDeletingId(recordId);
    setError(null);

    try {
      await deleteMedicalRecord(recordId);
      setRecords(prev => prev.filter(r => r.id !== recordId));
      showSuccess('Medical record deleted successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete record.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadSuccess = () => {
    fetchRecords();
    setShowUploadForm(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and upload button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search by patient name, title, or description..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="max-w-md pl-9"
            aria-label="Search medical records"
          />
        </div>
        <Button onClick={() => setShowUploadForm(!showUploadForm)} className="gap-2">
          <Upload className="h-4 w-4" />
          {showUploadForm ? 'Hide Upload Form' : 'Upload Record'}
        </Button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <MedicalRecordForm onSuccess={handleUploadSuccess} />
      )}

      {/* Error Message */}
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={fetchRecords}
        />
      )}

      {/* Records List */}
      {filteredRecords.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map(record => {
            const patientName = patients.get(record.patient_Id);
            return (
              <MedicalRecordCard
                key={record.id}
                record={record}
                patientName={patientName}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === record.id}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileX}
          title={searchQuery ? 'No records found' : 'No medical records yet'}
          description={
            searchQuery
              ? 'Try adjusting your search criteria or upload a new record.'
              : 'Upload your first medical record to get started.'
          }
          action={
            !showUploadForm && (
              <Button onClick={() => setShowUploadForm(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Record
              </Button>
            )
          }
        />
      )}

      {/* Details/Edit Modal */}
      {selectedRecord && (
        <MedicalRecordDetailsModal
          record={selectedRecord}
          patientName={patients.get(selectedRecord.patient_Id)}
          isOpen={isModalOpen}
          isEditing={isEditing}
          onClose={handleCloseModal}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this medical record. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingId(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingId) {
                    handleDelete(deletingId);
                    setDeletingId(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

