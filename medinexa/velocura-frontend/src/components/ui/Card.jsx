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
        hover ? 'hover:border-slate-700 transition-colors duration-150' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800/80 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, subtitle, className = '' }) => (
  <div>
    <h3 className={`text-base font-bold text-slate-100 tracking-tight ${className}`}>{children}</h3>
    {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-sans">{subtitle}</p>}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-end gap-3 ${className}`}>
    {children}
  </div>
);
