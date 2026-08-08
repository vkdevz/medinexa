import React from 'react';

/**
 * Enterprise Skeleton Loading Placeholder Component
 */
export const Skeleton = ({ className = '', height = 'h-4', width = 'w-full' }) => (
  <div className={`animate-pulse bg-[var(--border-default)] opacity-60 rounded ${height} ${width} ${className}`} />
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3 p-4">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4 items-center">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-6 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="surface-card p-6 space-y-4">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
    <div className="space-y-2 pt-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);
