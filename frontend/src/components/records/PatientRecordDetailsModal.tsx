'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MedicalRecord } from '@/types/api';
import { FileText, Calendar, Download, Stethoscope } from 'lucide-react';

interface PatientRecordDetailsModalProps {
  record: MedicalRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientRecordDetailsModal({ 
  record, 
  isOpen, 
  onClose 
}: PatientRecordDetailsModalProps) {
  if (!record) return null;

  const createdAt = new Date(record.createdAt);
  const hasFile = !!record.fileName || !!record.filePath;

  const handleDownload = () => {
    if (record.filePath) {
      // filePath should contain a signed URL from the backend
      window.open(record.filePath, '_blank');
    } else if (record.id) {
      // Fallback: try to construct download URL if filePath is not available
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      window.open(`${apiBaseUrl}/api/record/${record.id}/download`, '_blank');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Medical Record Details
          </AlertDialogTitle>
          <AlertDialogDescription>
            View your medical record information
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* Record Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Record Information
            </h3>
            <div className="space-y-3 pl-7">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Title:</span>
                <p className="text-base font-semibold">{record.title || 'Untitled Record'}</p>
              </div>
              {record.description && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Description:</span>
                  <p className="text-base text-muted-foreground whitespace-pre-wrap mt-1">
                    {record.description}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created At:
                </span>
                <p className="text-base mt-1">
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
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Download className="h-5 w-5" />
                File Attachment
              </h3>
              <div className="pl-7 space-y-3">
                {record.fileName && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">File Name:</span>
                    <p className="text-base">{record.fileName}</p>
                  </div>
                )}
                {record.contentType && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">File Type:</span>
                    <p className="text-base text-muted-foreground">{record.contentType}</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download File
                </Button>
              </div>
            </div>
          )}

          {!hasFile && (
            <div className="text-center py-4 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No file attachment available for this record.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

