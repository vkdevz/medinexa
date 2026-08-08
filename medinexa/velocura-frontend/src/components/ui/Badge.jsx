import React from 'react';

/**
 * Enterprise Role & Tag Badge Component
 * Variants: 'cyan', 'teal', 'purple', 'emerald', 'amber', 'red', 'slate'
 */
export const Badge = ({
  children,
  variant = 'slate',
  size = 'sm',
  className = ''
}) => {
  const variantStyles = {
    cyan: 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-cyan-500/20',
    teal: 'bg-[var(--color-teal-subtle)] text-[var(--color-teal)] border border-teal-500/20',
    purple: 'bg-[var(--color-purple-subtle)] text-[var(--color-purple)] border border-purple-500/20',
    emerald: 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border border-emerald-500/20',
    amber: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border border-amber-500/20',
    red: 'bg-[var(--color-danger-subtle)] text-[var(--color-danger)] border border-red-500/20',
    slate: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs font-semibold'
  };

  return (
    <span className={`inline-flex items-center font-mono font-medium uppercase tracking-wider rounded ${variantStyles[variant] || variantStyles.slate} ${sizeStyles[size] || sizeStyles.sm} ${className}`}>
      {children}
    </span>
  );
};
