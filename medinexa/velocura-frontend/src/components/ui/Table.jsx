import React from 'react';

/**
 * Enterprise Clinical Data Table Component
 */
export const Table = ({ children, className = '' }) => (
  <div className="w-full overflow-x-auto custom-scrollbar rounded-lg border border-slate-800 bg-slate-900/50">
    <table className={`w-full text-left text-sm text-slate-300 ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children }) => (
  <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800">
    {children}
  </thead>
);

export const TableBody = ({ children }) => (
  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', onClick }) => (
  <tr
    onClick={onClick}
    className={`${onClick ? 'cursor-pointer hover:bg-slate-850/60' : 'hover:bg-slate-900/40'} transition-colors duration-150 ${className}`}
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
