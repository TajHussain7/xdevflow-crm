'use client';

import Link from 'next/link';
import type { Lead } from '@/types';
import LeadStatusBadge from './LeadStatusBadge';
import { getInitials } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
}

export default function LeadCard({ lead }: LeadCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 rounded-2xl shadow-card hover:shadow-md transition-all flex flex-col justify-between h-48 animate-fade-in">
      <div>
        <div className="flex items-start justify-between mb-2">
          <Link
            href={`/leads/${lead.id}`}
            className="font-bold text-headline-md text-primary hover:underline leading-tight"
          >
            {lead.full_name}
          </Link>
          <LeadStatusBadge status={lead.status} />
        </div>
        <p className="text-body-md font-medium text-on-surface mb-1">{lead.company}</p>
        <span className="text-secondary text-xs block">{lead.email}</span>
        <span className="text-secondary text-xs block">{lead.phone}</span>
      </div>

      <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3 mt-4">
        <span className="text-label-md text-secondary">Assignee</span>
        {lead.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-[9px] font-bold">
              {getInitials(lead.assignee.full_name)}
            </div>
            <span className="text-xs text-on-surface font-medium">{lead.assignee.full_name}</span>
          </div>
        ) : (
          <span className="text-secondary text-xs italic">Unassigned</span>
        )}
      </div>
    </div>
  );
}
