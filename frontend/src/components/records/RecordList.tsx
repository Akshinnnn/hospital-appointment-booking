'use client'

import React, { useState, useEffect } from "react";
import { getMyRecords } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { FileText } from 'lucide-react';

interface MedicalRecord {
    id: string;
    date: string;
    doctorName: string;
    specialization: string;
    diagnosis: string;
    notes: string;
}

export const RecordList = () => {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        getMyRecords()
        .then(response => {
            // Response interceptor already unwraps ApiResponse, but handle both cases
            const recordsData = (response.data as any)?.data || response.data || [];
            setRecords(Array.isArray(recordsData) ? recordsData : []);
        })
        .catch(() => {
            setError("Could not fetch medical records.")
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading your records...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
        {records.length > 0 ? (
            records.map(record => (
            <Card key={record.id} className="shadow-md">
                <CardHeader>
                <CardTitle>Record: {record.diagnosis}</CardTitle>
                <CardDescription>
                    {new Date(record.date).toLocaleDateString()} with Dr. {record.doctorName} ({record.specialization})
                </CardDescription>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground">{record.notes}</p>
                </CardContent>
            </Card>
            ))
        ) : (
            <Card className="flex flex-col items-center justify-center p-10 shadow-md">
            <FileText size={48} className="text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No Records Found</h3>
            <p className="mt-2 text-muted-foreground text-center">
                Your medical records will appear here once they are available.
            </p>
            </Card>
        )}
        </div>
    );
}