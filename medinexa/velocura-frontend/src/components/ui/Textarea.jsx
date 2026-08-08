import React from 'react';

/**
 * Enterprise Form Textarea Component
 */
export const Textarea = ({
  label,
  id,
  rows = 4,
  error,
  helperText,
  required = false,
  className = '',
  value,
  onChange,
  placeholder,
  disabled = false,
  ...props
}) => {
  const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={areaId} className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] font-mono">
          {label} {required && <span className="text-red-500 dark:text-red-400 font-bold">*</span>}
        </label>
      )}
      <textarea
        id={areaId}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full bg-[var(--bg-app)] border ${
          error ? 'border-red-500/60 focus:border-red-500' : 'border-[var(--border-subtle)] focus:border-[var(--border-focus)]'
        } rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)] disabled:opacity-50 transition-all duration-150 custom-scrollbar ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 dark:text-red-400 font-mono mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{helperText}</p>}
    </div>
  );
};
