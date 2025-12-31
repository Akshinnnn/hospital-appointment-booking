'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onRetry, className }: ErrorDisplayProps) {
  return (
    <Card className={cn('border-destructive/50', className)}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
          {onRetry && (
            <Button variant="outline" onClick={onRetry} size="sm">
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

