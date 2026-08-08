import React from 'react';

/**
 * Enterprise Clinical Status Indicator Component
 */
export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  const statusConfig = {
    CONFIRMED: { label: 'Confirmed', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', dot: 'bg-emerald-400' },
    COMPLETED: { label: 'Completed', style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25', dot: 'bg-cyan-400' },
    PENDING: { label: 'Pending', style: 'bg-amber-500/10 text-amber-400 border-amber-500/25', dot: 'bg-amber-400 animate-pulse' },
    CANCELLED: { label: 'Cancelled', style: 'bg-red-500/10 text-red-400 border-red-500/25', dot: 'bg-red-400' },
    
    // Triage risk levels
    EMERGENCY: { label: 'Emergency', style: 'bg-red-500/15 text-red-400 border-red-500/40 font-bold', dot: 'bg-red-500 animate-ping' },
    HIGH: { label: 'High Severity', style: 'bg-orange-500/15 text-orange-400 border-orange-500/30 font-semibold', dot: 'bg-orange-400' },
    MEDIUM: { label: 'Moderate', style: 'bg-amber-500/10 text-amber-400 border-amber-500/25', dot: 'bg-amber-400' },
    ROUTINE: { label: 'Routine Care', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
    LOW: { label: 'Low Risk', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' }
  };

  const config = statusConfig[normalized] || {
    label: normalized,
    style: 'bg-slate-800 text-slate-300 border-slate-700',
    dot: 'bg-slate-400'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${config.style} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
