import React from 'react';

/**
 * Enterprise Clinical Status Indicator Component
 */
export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  const statusConfig = {
    CONFIRMED: { label: 'Confirmed', style: 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success-subtle)]', dot: 'bg-emerald-500 dark:bg-emerald-400' },
    COMPLETED: { label: 'Completed', style: 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border-[var(--color-primary-subtle)]', dot: 'bg-cyan-500 dark:bg-cyan-400' },
    PENDING: { label: 'Pending', style: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[var(--color-warning-subtle)]', dot: 'bg-amber-500 dark:bg-amber-400 animate-pulse' },
    CANCELLED: { label: 'Cancelled', style: 'bg-[var(--color-danger-subtle)] text-[var(--color-danger)] border-[var(--color-danger-subtle)]', dot: 'bg-red-500 dark:bg-red-400' },
    
    // Triage risk levels
    EMERGENCY: { label: 'Emergency', style: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40 font-bold', dot: 'bg-red-500 animate-ping' },
    HIGH: { label: 'High Severity', style: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30 font-semibold', dot: 'bg-orange-500' },
    MEDIUM: { label: 'Moderate', style: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[var(--color-warning-subtle)]', dot: 'bg-amber-500 dark:bg-amber-400' },
    ROUTINE: { label: 'Routine Care', style: 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success-subtle)]', dot: 'bg-emerald-500 dark:bg-emerald-400' },
    LOW: { label: 'Low Risk', style: 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success-subtle)]', dot: 'bg-emerald-500 dark:bg-emerald-400' }
  };

  const config = statusConfig[normalized] || {
    label: normalized,
    style: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    dot: 'bg-[var(--text-muted)]'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${config.style} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
