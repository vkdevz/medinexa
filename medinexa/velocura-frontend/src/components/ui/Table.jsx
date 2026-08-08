import React from 'react';

/**
 * Enterprise Clinical Data Table Component
 */
export const Table = ({ children, className = '' }) => (
  <div className="w-full overflow-x-auto custom-scrollbar rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
    <table className={`w-full text-left text-sm text-[var(--text-primary)] ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children }) => (
  <thead className="bg-[var(--bg-elevated)] text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] font-mono border-b border-[var(--border-subtle)]">
    {children}
  </thead>
);

export const TableBody = ({ children }) => (
  <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-surface)]">
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', onClick }) => (
  <tr
    onClick={onClick}
    className={`${onClick ? 'cursor-pointer hover:bg-[var(--bg-elevated)]' : 'hover:bg-[var(--bg-elevated)]/50'} transition-colors duration-150 ${className}`}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = '' }) => (
  <th className={`px-4 py-3.5 ${className}`}>{children}</th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-4 py-3.5 align-middle ${className}`}>{children}</td>
);
