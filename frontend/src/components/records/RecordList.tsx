'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getMyRecords } from '@/lib/api';
import { MedicalRecord } from '@/types/api';
import { PatientRecordCard } from './PatientRecordCard';
import { PatientRecordDetailsModal } from './PatientRecordDetailsModal';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';

export const RecordList = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRecords = () => {
    setIsLoading(true);
    setError(null);
    getMyRecords()
      .then(response => {
        // Response interceptor already unwraps ApiResponse, but handle both cases
        const recordsData = (response.data as any)?.data || response.data || [];
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

  // Filter records by search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;

    const query = searchQuery.toLowerCase();
    return records.filter(record => {
      const title = record.title?.toLowerCase() || '';
      const description = record.description?.toLowerCase() || '';
      const fileName = record.fileName?.toLowerCase() || '';
      
      return title.includes(query) || 
             description.includes(query) || 
             fileName.includes(query);
    });
  }, [records, searchQuery]);

  // Sort records by creation date (newest first)
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredRecords]);

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12 gap-2">
          <LoadingSpinner />
          <span className="text-muted-foreground">Loading your records...</span>
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
        onRetry={fetchRecords}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Records
          </CardTitle>
          <CardDescription>Search by title, description, or filename</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      {sortedRecords.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedRecords.map(record => (
            <PatientRecordCard
              key={record.id}
              record={record}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={searchQuery ? "No records found" : "No medical records"}
          description={
            searchQuery
              ? "No records match your search. Try adjusting your search terms."
              : "Your medical records will appear here once they are available from your doctors."
          }
        />
      )}

      {/* Record Details Modal */}
      <PatientRecordDetailsModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};
