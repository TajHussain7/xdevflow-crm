"use client";

import React from "react";
import { useLead, useDeleteLead } from "@/hooks/useLeads";
import LeadStatusBadge from "@/components/leads/LeadStatusBadge";
import LeadStatusTransition from "@/components/leads/LeadStatusTransition";
import ActivityTimeline from "@/components/leads/ActivityTimeline";
import { usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User,
  Briefcase,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LeadDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const { data: lead, isLoading } = useLead(id);
  const deleteMutation = useDeleteLead();
  const { canEdit, canDelete } = usePermissions();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this lead?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          router.push("/leads");
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="space-y-6 animate-pulse p-4 md:p-8 max-w-6xl mx-auto">
          <div className="h-4 bg-surface-container rounded-full w-40" />
          <div className="h-9 bg-surface-container rounded-xl w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-surface-container rounded-2xl" />
            <div className="h-96 bg-surface-container rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <span className="material-symbols-outlined text-[52px] text-outline/40 block mb-3">
            person_off
          </span>
          <h3 className="text-headline-md text-on-surface font-bold mb-2">
            Lead Not Found
          </h3>
          <p className="text-secondary text-sm mb-5">
            This lead may have been removed or never existed.
          </p>
          <Link
            href="/leads"
            className="text-primary font-semibold hover:underline flex items-center gap-1 justify-center"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            Return to directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/leads"
            className="flex items-center gap-2 text-sm text-secondary hover:text-on-surface font-medium transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-surface-container-low border border-outline-variant/50 flex items-center justify-center group-hover:bg-surface-container transition-colors">
              <ArrowLeft size={14} />
            </div>
            Back to Directory
          </Link>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Link
                href={`/leads/${lead.id}/edit`}
                className="flex items-center gap-2 py-2 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-sm font-semibold shadow-sm transition-all active:scale-95"
              >
                <Edit size={14} />
                Edit Lead
              </Link>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 py-2 px-4 rounded-xl border border-error/30 text-error hover:bg-error-container/20 text-sm font-semibold transition-all active:scale-95 disabled:opacity-60"
              >
                <Trash2 size={14} />
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>

        {/* Hero card */}
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          {/* Gradient banner */}
          <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/10 relative">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, var(--color-primary) 0%, transparent 60%)",
              }}
            />
          </div>

          {/* Profile row */}
          <div className="px-6 sm:px-8 pb-6 -mt-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-2xl font-extrabold border-4 border-surface-container-lowest shadow-md flex-shrink-0">
                {getInitials(lead.full_name)}
              </div>
              <div className="pb-1">
                <h2 className="text-headline-lg text-on-surface font-extrabold tracking-tight leading-tight">
                  {lead.full_name}
                </h2>
                {lead.company && (
                  <p className="text-body-md font-semibold text-secondary flex items-center gap-1.5 mt-0.5">
                    <Briefcase size={14} />
                    {lead.company}
                  </p>
                )}
              </div>
            </div>
            <div className="pb-1">
              <LeadStatusBadge
                status={lead.status}
                className="text-sm py-1 px-3"
              />
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Details card */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="px-6 sm:px-8 py-4 border-b border-outline-variant/30 bg-surface-container-low/40 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  contact_page
                </span>
                <h3 className="font-semibold text-on-surface text-sm">
                  Contact Details
                </h3>
              </div>
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3.5 group">
                    <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 border border-primary/12">
                      <Mail className="text-primary" size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-secondary block uppercase tracking-wide mb-0.5">
                        Email Address
                      </span>
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-body-md text-primary font-medium hover:underline text-sm"
                      >
                        {lead.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 border border-primary/12">
                      <Phone className="text-primary" size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-secondary block uppercase tracking-wide mb-0.5">
                        Phone Number
                      </span>
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-body-md text-on-surface font-medium text-sm"
                      >
                        {lead.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 border border-primary/12">
                      <Calendar className="text-primary" size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-secondary block uppercase tracking-wide mb-0.5">
                        Created Date
                      </span>
                      <span className="text-body-md text-on-surface font-medium text-sm">
                        {new Date(lead.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 border border-primary/12">
                      <User className="text-primary" size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-secondary block uppercase tracking-wide mb-0.5">
                        Account Manager
                      </span>
                      {lead.assignee ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/15">
                            {getInitials(lead.assignee.full_name)}
                          </div>
                          <span className="text-body-md text-on-surface font-medium text-sm">
                            {lead.assignee.full_name}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-secondary text-sm bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant/30 mt-0.5">
                          <span className="material-symbols-outlined text-[12px]">
                            person_off
                          </span>
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {lead.notes && (
                  <div className="mt-7 pt-6 border-t border-outline-variant/30">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary text-[16px]">
                        sticky_note_2
                      </span>
                      <h3 className="font-bold text-sm text-on-surface">
                        Notes & Context
                      </h3>
                    </div>
                    <div className="bg-surface-container/50 rounded-xl p-4 border border-outline-variant/30">
                      <p className="text-body-md text-secondary whitespace-pre-wrap leading-relaxed text-sm">
                        {lead.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {/* Status Transition Card */}
            {lead && <LeadStatusTransition lead={lead} />}

            {/* Activity Timeline */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant/30 bg-surface-container-low/40 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  history
                </span>
                <h3 className="font-semibold text-on-surface text-sm">
                  Activity History
                </h3>
              </div>
              <div className="p-5">
                <ActivityTimeline leadId={lead.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
