'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MedicalRecord } from '@/types/api';
import { FileText, Calendar, Eye, Download } from 'lucide-react';

interface PatientRecordCardProps {
  record: MedicalRecord;
  onViewDetails: (record: MedicalRecord) => void;
}

export function PatientRecordCard({ record, onViewDetails }: PatientRecordCardProps) {
  const createdAt = new Date(record.createdAt);
  const hasFile = !!record.fileName || !!record.filePath;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {record.title || 'Medical Record'}
            </CardTitle>
            <CardDescription className="mt-1">
              Created {createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CardDescription>
          </div>
          {hasFile && (
            <div className="px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
              File
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {createdAt.toLocaleDateString('en-US', {
                weekday: 'long',
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
                  {record.contentType.split('/')[1]?.toUpperCase() || 'FILE'}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(record)}
          className="w-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

