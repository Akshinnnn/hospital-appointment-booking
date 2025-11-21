'use client';

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MedicalRecord } from '@/types/api';
import { FileText, User, Calendar, Download, Edit, AlertCircle } from 'lucide-react';
import { updateMedicalRecord } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const updateRecordSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

type UpdateRecordFormData = z.infer<typeof updateRecordSchema>;

interface MedicalRecordDetailsModalProps {
  record: MedicalRecord | null;
  patientName?: string;
  isOpen: boolean;
  isEditing: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;
}

export function MedicalRecordDetailsModal({
  record,
  patientName,
  isOpen,
  isEditing,
  onClose,
  onEdit,
  onSave,
}: MedicalRecordDetailsModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success: showSuccess, error: showError } = useToast();

  const form = useForm<UpdateRecordFormData>({
    resolver: zodResolver(updateRecordSchema),
    defaultValues: {
      title: record?.title || '',
      description: record?.description || '',
    },
  });

  React.useEffect(() => {
    if (record) {
      form.reset({
        title: record.title || '',
        description: record.description || '',
      });
    }
  }, [record, form]);

  if (!record) return null;

  const createdAt = new Date(record.createdAt);
  const hasFile = !!record.fileName || !!record.filePath;

  const handleDownload = () => {
    if (record.filePath) {
      // filePath should contain a signed URL from the backend
      window.open(record.filePath, '_blank');
    }
  };

  const handleSave = async (data: UpdateRecordFormData) => {
    setError(null);
    setIsSaving(true);

    try {
      await updateMedicalRecord(record.id, data.title, data.description);
      showSuccess('Record updated successfully!');
      setTimeout(() => {
        onSave();
        onClose();
      }, 500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update record.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Medical Record Details
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isEditing ? 'Edit the medical record details' : 'View medical record information'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={isSaving} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving && <LoadingSpinner size="sm" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-6 py-4">
            {/* Patient Information */}
            {patientName && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient
                </h3>
                <div className="pl-7">
                  <p className="text-base">{patientName}</p>
                  <p className="text-sm text-muted-foreground">ID: {record.patient_Id}</p>
                </div>
              </div>
            )}

            {/* Record Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Record Information
              </h3>
              <div className="space-y-3 pl-7">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Title:</span>
                  <p className="text-base">{record.title || 'Untitled Record'}</p>
                </div>
                {record.description && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Description:</span>
                    <p className="text-base text-muted-foreground whitespace-pre-wrap">
                      {record.description}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Created At:
                  </span>
                  <p className="text-base">
                    {createdAt.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {createdAt.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* File Information */}
            {hasFile && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">File Attachment</h3>
                <div className="pl-7 space-y-2">
                  {record.fileName && (
                    <p className="text-base">{record.fileName}</p>
                  )}
                  {record.contentType && (
                    <p className="text-sm text-muted-foreground">
                      Type: {record.contentType}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download File
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={onEdit} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

