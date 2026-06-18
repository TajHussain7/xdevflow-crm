'use client';

import Link from 'next/link';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lead } from '@/types';
import LeadStatusBadge from './LeadStatusBadge';
import { usePermissions } from '@/hooks/usePermissions';
import { getInitials } from '@/lib/utils';

interface LeadTableProps {
  leads: Lead[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
}

export default function LeadTable({
  leads,
  currentPage,
  totalPages,
  onPageChange,
  onDelete,
}: LeadTableProps) {
  const { canEdit, canDelete } = usePermissions();

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/50 text-secondary text-label-md">
              <th className="p-4 font-semibold">Lead Details</th>
              <th className="p-4 font-semibold">Company</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Assignee</th>
              <th className="p-4 font-semibold">Created By</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-body-md text-on-surface">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-secondary">
                  No leads found. Create one to get started!
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-surface-container-low/50 transition-colors">
                  {/* Lead Info */}
                  <td className="p-4">
                    <div>
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-semibold text-primary hover:underline block"
                      >
                        {lead.full_name}
                      </Link>
                      <span className="text-secondary text-xs block">{lead.email}</span>
                      <span className="text-secondary text-xs block">{lead.phone}</span>
                    </div>
                  </td>
                  {/* Company */}
                  <td className="p-4 align-middle font-medium">{lead.company}</td>
                  {/* Status */}
                  <td className="p-4 align-middle">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  {/* Assignee */}
                  <td className="p-4 align-middle">
                    {lead.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-[10px] font-bold">
                          {getInitials(lead.assignee.full_name)}
                        </div>
                        <span className="text-xs">{lead.assignee.full_name}</span>
                      </div>
                    ) : (
                      <span className="text-secondary text-xs italic">Unassigned</span>
                    )}
                  </td>
                  {/* Creator */}
                  <td className="p-4 align-middle text-secondary text-xs">
                    {lead.creator?.full_name || 'System'}
                  </td>
                  {/* Actions */}
                  <td className="p-4 align-middle text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="p-1.5 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </Link>
                      {canEdit && (
                        <Link
                          href={`/leads/${lead.id}/edit`}
                          className="p-1.5 rounded-lg text-primary hover:bg-primary-fixed hover:text-on-primary-fixed-variant transition-colors"
                          title="Edit lead"
                        >
                          <Edit size={16} />
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this lead?')) {
                              onDelete(lead.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-error hover:bg-error-container hover:text-on-error-container transition-colors"
                          title="Delete lead"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-surface-container-low border-t border-outline-variant/50">
          <span className="text-body-md text-secondary">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
