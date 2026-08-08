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
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    teal: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border border-red-500/20',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700'
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
