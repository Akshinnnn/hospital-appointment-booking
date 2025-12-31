'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MedicalRecord } from '@/types/api';
import { FileText, User, Calendar, Eye, Edit, Trash2 } from 'lucide-react';

interface MedicalRecordCardProps {
  record: MedicalRecord;
  patientName?: string;
  onView: (record: MedicalRecord) => void;
  onEdit: (record: MedicalRecord) => void;
  onDelete: (recordId: string) => void;
  isDeleting?: boolean;
}

export function MedicalRecordCard({
  record,
  patientName,
  onView,
  onEdit,
  onDelete,
  isDeleting = false,
}: MedicalRecordCardProps) {
  const createdAt = new Date(record.createdAt);
  const hasFile = !!record.fileName || !!record.filePath;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              {record.title || 'Untitled Record'}
            </CardTitle>
            {patientName && (
              <CardDescription className="mt-1 flex items-center gap-2">
                <User className="h-3 w-3" />
                {patientName}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          {record.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {record.description}
            </p>
          )}
          {hasFile && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              {record.fileName || 'File attached'}
              {record.contentType && (
                <span className="px-1.5 py-0.5 bg-muted rounded text-xs">
                  {record.contentType.split('/')[1]?.toUpperCase()}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(record)}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(record)}
          className="flex-1"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(record.id)}
          disabled={isDeleting}
          className="flex-1"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

