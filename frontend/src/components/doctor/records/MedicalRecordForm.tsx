'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { uploadMedicalRecord } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PatientSelector } from './PatientSelector';
import { Upload, File as FileIcon, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Progress } from '@/components/ui/progress';

const medicalRecordSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  file: z
    .custom<File>((val) => val instanceof File, { message: 'File is required' })
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      'File size must be less than 10MB'
    ),
});

type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>;

interface MedicalRecordFormProps {
  onSuccess?: () => void;
}

export function MedicalRecordForm({ onSuccess }: MedicalRecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { success: showSuccess, error: showError } = useToast();

  const form = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patientId: '',
      title: '',
      description: '',
    },
  });

  const onSubmit = async (data: MedicalRecordFormData) => {
    setError(null);
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress (since axios doesn't provide progress for FormData in this setup)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await uploadMedicalRecord(
        data.patientId,
        data.title,
        data.description || '',
        data.file
      );

      clearInterval(progressInterval);
      setUploadProgress(100);
      showSuccess('Medical record uploaded successfully!');
      
      // Reset form
      form.reset({
        patientId: '',
        title: '',
        description: '',
      });
      setSelectedFile(null);
      form.setValue('file', undefined as any, { shouldValidate: false });
      // Reset the file input element
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      setUploadProgress(0);

      // Call success callback
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (err: any) {
      setUploadProgress(0);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload medical record.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    form.setValue('file', undefined as any, { shouldValidate: false });
    // Reset the file input element
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Medical Record
        </CardTitle>
        <CardDescription>
          Upload a medical record file for one of your patients.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PatientSelector
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter record title" {...field} disabled={isSubmitting} />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter record description"
                      {...field}
                      disabled={isSubmitting}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {!selectedFile ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                                setSelectedFile(file);
                              }
                            }}
                            disabled={isSubmitting}
                            {...field}
                            value={undefined}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
                          <FileIcon className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG. Max file size: 10MB
                  </p>
                </FormItem>
              )}
            />

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {isSubmitting && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
              {isSubmitting && <LoadingSpinner size="sm" />}
              {isSubmitting ? 'Uploading...' : 'Upload Medical Record'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

