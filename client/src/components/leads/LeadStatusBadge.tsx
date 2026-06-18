'use client';

import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/types';

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  new: {
    label: 'New',
    bg: 'bg-status-new-bg',
    text: 'text-status-new-text',
    border: 'border-status-new-text/20',
  },
  contacted: {
    label: 'Contacted',
    bg: 'bg-status-contacted-bg',
    text: 'text-status-contacted-text',
    border: 'border-status-contacted-text/20',
  },
  qualified: {
    label: 'Qualified',
    bg: 'bg-status-qualified-bg',
    text: 'text-status-qualified-text',
    border: 'border-status-qualified-text/20',
  },
  proposal: {
    label: 'Proposal',
    bg: 'bg-status-proposal-bg',
    text: 'text-status-proposal-text',
    border: 'border-status-proposal-text/20',
  },
  closed_won: {
    label: 'Won',
    bg: 'bg-status-won-bg',
    text: 'text-status-won-text',
    border: 'border-status-won-text/20',
  },
  closed_lost: {
    label: 'Lost',
    bg: 'bg-status-lost-bg',
    text: 'text-status-lost-text',
    border: 'border-status-lost-text/20',
  },
};

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
  /** Show a small dot indicator before label — used in profile hero card */
  withDot?: boolean;
}

export default function LeadStatusBadge({
  status,
  className,
  withDot,
}: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-400/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {withDot && (
        <span className={cn('w-2 h-2 rounded-full', config.text.replace('text-', 'bg-'))} />
      )}
      {config.label}
    </span>
  );
}
