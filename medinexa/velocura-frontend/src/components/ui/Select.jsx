import React from 'react';

/**
 * Enterprise Form Select Component
 */
export const Select = ({
  label,
  id,
  options = [],
  error,
  helperText,
  required = false,
  className = '',
  value,
  onChange,
  disabled = false,
  placeholder = 'Select option...',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          {label} {required && <span className="text-red-400 font-bold">*</span>}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full bg-slate-950 border ${
          error ? 'border-red-500/60 focus:border-red-500' : 'border-slate-800 focus:border-cyan-500/50'
        } rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-50 transition-all duration-150 ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-slate-900 text-slate-500">
            {placeholder}
          </option>
        )}
        {options.map((opt, idx) => (
          <option key={idx} value={typeof opt === 'object' ? opt.value : opt} className="bg-slate-900 text-slate-100">
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400 font-mono mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500 font-mono mt-1">{helperText}</p>}
    </div>
  );
};
