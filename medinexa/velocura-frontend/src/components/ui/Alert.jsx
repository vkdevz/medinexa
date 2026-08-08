import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Enterprise Clinical Alert Banner Component
 * Variants: 'info', 'success', 'warning', 'error'
 */
export const Alert = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = ''
}) => {
  const configs = {
    info: { icon: Info, style: 'bg-[var(--color-primary-subtle)] border-cyan-500/30 text-[var(--color-primary)]' },
    success: { icon: CheckCircle2, style: 'bg-[var(--color-success-subtle)] border-emerald-500/30 text-[var(--color-success)]' },
    warning: { icon: AlertTriangle, style: 'bg-[var(--color-warning-subtle)] border-amber-500/30 text-[var(--color-warning)]' },
    error: { icon: AlertCircle, style: 'bg-[var(--color-danger-subtle)] border-red-500/30 text-[var(--color-danger)]' }
  };

  const config = configs[variant] || configs.info;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border flex items-start gap-3 text-xs leading-relaxed ${config.style} ${className}`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h5 className="font-bold mb-0.5">{title}</h5>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-75 p-0.5 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
