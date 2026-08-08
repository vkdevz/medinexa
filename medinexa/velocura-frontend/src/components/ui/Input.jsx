import React from 'react';

/**
 * Enterprise Form Input Component
 */
export const Input = ({
  label,
  id,
  type = 'text',
  error,
  helperText,
  icon: Icon,
  required = false,
  className = '',
  value,
  onChange,
  placeholder,
  disabled = false,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          {label} {required && <span className="text-red-400 font-bold">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full bg-slate-950 border ${
            error ? 'border-red-500/60 focus:border-red-500' : 'border-slate-800 focus:border-cyan-500/50'
          } rounded-lg ${
            Icon ? 'pl-10' : 'px-3.5'
          } py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-50 disabled:bg-slate-900 transition-all duration-150 ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 font-mono mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500 font-mono mt-1">{helperText}</p>}
    </div>
  );
};
