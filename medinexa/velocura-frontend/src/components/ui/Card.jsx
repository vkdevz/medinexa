import React from 'react';

/**
 * Enterprise Solid Surface Card Component
 */
export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  ...props
}) => {
  return (
    <div
      className={`surface-card ${padding} ${
        hover ? 'hover:border-[var(--border-default)] transition-all duration-150 shadow-sm hover:shadow-md' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[var(--border-subtle)] ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, subtitle, className = '' }) => (
  <div>
    <h3 className={`text-base font-bold text-[var(--text-primary)] tracking-tight ${className}`}>{children}</h3>
    {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-sans">{subtitle}</p>}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3 ${className}`}>
    {children}
  </div>
);
