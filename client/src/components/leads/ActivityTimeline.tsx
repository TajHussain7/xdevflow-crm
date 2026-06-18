'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ActivityLog, ApiResponse } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';

interface ActivityTimelineProps {
  leadId: string;
}

export default function ActivityTimeline({ leadId }: ActivityTimelineProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activity', leadId],
    queryFn: () =>
      api.get<ApiResponse<ActivityLog[]>>(`/activity/${leadId}`).then((r) => r.data.data),
    enabled: !!leadId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-surface-container rounded-lg" />
        <div className="h-10 bg-surface-container rounded-lg" />
        <div className="h-10 bg-surface-container rounded-lg" />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="p-6 text-center text-secondary text-body-md border border-dashed border-outline-variant rounded-2xl">
        No activity history recorded yet.
      </div>
    );
  }

  return (
    <div className="relative border-l border-outline-variant/60 ml-3 pl-6 space-y-6">
      {activities.map((activity) => {
        let icon = <Edit2 size={16} className="text-primary" />;
        let title = '';

        if (activity.action === 'created') {
          icon = <PlusCircle size={16} className="text-success" />;
          title = 'Lead created';
        } else if (activity.action === 'deleted') {
          icon = <Trash2 size={16} className="text-error" />;
          title = 'Lead deleted';
        } else {
          title = 'Lead details updated';
        }

        return (
          <div key={activity.id} className="relative animate-fade-in">
            {/* Timeline node icon */}
            <span className="absolute -left-[35px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-surface-container-low border border-outline-variant">
              {icon}
            </span>

            {/* Content card */}
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h4 className="font-semibold text-body-md text-on-surface">{title}</h4>
                <span className="text-xs text-secondary">{formatRelativeTime(activity.created_at)}</span>
              </div>

              {/* Show user who did it */}
              <p className="text-xs text-secondary mb-2">
                Performed by <span className="font-medium text-on-surface">{activity.user?.full_name || 'System'}</span>
              </p>

              {/* Show detail updates if action was an update */}
              {activity.action === 'updated' && activity.changed_fields && (
                <ul className="space-y-1.5 border-t border-outline-variant/20 pt-2 mt-2">
                  {Object.entries(activity.changed_fields).map(([field, diff]) => {
                    const fromVal = diff.from === null || diff.from === '' ? 'None' : String(diff.from);
                    const toVal = diff.to === null || diff.to === '' ? 'None' : String(diff.to);

                    return (
                      <li key={field} className="text-xs text-secondary">
                        <span className="capitalize font-medium text-on-surface-variant">{field.replace('_', ' ')}</span> changed from{' '}
                        <span className="line-through text-error">{fromVal}</span> to{' '}
                        <span className="text-success font-medium">{toVal}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
