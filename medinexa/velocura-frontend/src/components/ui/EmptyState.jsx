import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

/**
 * Enterprise Empty State Component
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no active records available for this section at this time.',
  actionLabel,
  onAction,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] my-4 ${className}`}>
    <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] mb-3 border border-[var(--border-subtle)]">
      <Icon className="w-6 h-6 text-[var(--color-primary)]" />
    </div>
    <h4 className="text-sm font-bold text-[var(--text-primary)]">{title}</h4>
    <p className="text-xs text-[var(--text-secondary)] max-w-sm mt-1 mb-4 leading-relaxed font-sans">{description}</p>
    {actionLabel && onAction && (
      <Button variant="secondary" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
