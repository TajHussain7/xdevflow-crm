"use client";

import React from 'react';
import { useLead, useUpdateLead } from "@/hooks/useLeads";
import LeadForm from "@/components/leads/LeadForm";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import type { CreateLeadInput } from "@/types";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditLeadPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const { data: lead, isLoading } = useLead(id);
  const updateMutation = useUpdateLead();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = (data: CreateLeadInput) => {
    setErrorMsg(null);
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          router.push(`/leads/${id}`);
        },
        onError: (err: any) => {
          setErrorMsg(
            err.response?.data?.error?.message ||
              "Failed to update lead. Please check the fields.",
          );
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-pulse">
          <div className="h-4 bg-surface-container rounded-full w-40" />
          <div className="h-9 bg-surface-container rounded-xl w-1/3" />
          <div className="h-96 bg-surface-container rounded-2xl" />
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
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-secondary">
          <Link
            href="/leads"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">
              filter_list
            </span>
            Leads
          </Link>
          <span className="material-symbols-outlined text-[14px] text-outline/50">
            chevron_right
          </span>
          <Link
            href={`/leads/${id}`}
            className="hover:text-primary transition-colors"
          >
            {lead.full_name}
          </Link>
          <span className="material-symbols-outlined text-[14px] text-outline/50">
            chevron_right
          </span>
          <span className="text-on-surface font-semibold">Edit</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-display-lg text-on-surface font-extrabold tracking-tight">
              Edit Lead
            </h2>
            <p className="text-body-lg text-secondary mt-1">
              Modify properties or reassign ownership of{" "}
              <span className="font-semibold text-on-surface">
                {lead.full_name}
              </span>
              .
            </p>
          </div>
          <Link
            href={`/leads/${id}`}
            className="flex items-center gap-1.5 text-sm text-secondary hover:text-on-surface font-medium transition-colors bg-surface-container-low border border-outline-variant/50 px-3 py-2 rounded-xl hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            Cancel
          </Link>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-4 bg-error-container/80 text-on-error-container rounded-xl text-xs font-semibold flex items-center gap-2.5 border border-error/20 animate-fade-in">
            <ShieldAlert size={15} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-6 sm:px-8 py-4 border-b border-outline-variant/30 bg-surface-container-low/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[18px]">
                edit_note
              </span>
            </div>
            <div>
              <p className="font-semibold text-on-surface text-sm">
                Update Lead Information
              </p>
              <p className="text-xs text-secondary">
                Changes will take effect immediately
              </p>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <LeadForm
              initialValues={{
                full_name: lead.full_name,
                company: lead.company,
                email: lead.email,
                phone: lead.phone,
                status: lead.status,
                notes: lead.notes || "",
                assigned_to: lead.assigned_to || "",
              }}
              onSubmit={onSubmit}
              isLoading={updateMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
