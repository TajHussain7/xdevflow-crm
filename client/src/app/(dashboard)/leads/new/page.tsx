"use client";

import { useCreateLead } from "@/hooks/useLeads";
import LeadForm from "@/components/leads/LeadForm";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import type { CreateLeadInput } from "@/types";
import Link from "next/link";

export default function NewLeadPage() {
  const router = useRouter();
  const createMutation = useCreateLead();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = (data: CreateLeadInput) => {
    setErrorMsg(null);
    createMutation.mutate(data, {
      onSuccess: () => {
        router.push("/leads");
      },
      onError: (err) => {
        setErrorMsg(
          (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
            "Failed to create lead. Please verify the fields.",
        );
      },
    });
  };

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
          <span className="text-on-surface font-semibold">New Lead</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-display-lg text-on-surface font-extrabold tracking-tight">
              New Lead
            </h2>
            <p className="text-body-lg text-secondary mt-1">
              Register a new client engagement prospect.
            </p>
          </div>
          <Link
            href="/leads"
            className="flex items-center gap-1.5 text-sm text-secondary hover:text-on-surface font-medium transition-colors bg-surface-container-low border border-outline-variant/50 px-3 py-2 rounded-xl hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            Back
          </Link>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-4 bg-error-container/80 text-on-error-container rounded-xl text-xs font-semibold flex items-center gap-2.5 border border-error/20 animate-fade-in">
            <ShieldAlert size={15} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[14px]">
                edit_note
              </span>
            </div>
            <span className="text-sm font-semibold text-primary">
              Fill Details
            </span>
          </div>
          <div className="flex-1 h-px bg-outline-variant/40 max-w-[60px]" />
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-7 h-7 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center">
              <span className="text-xs font-bold text-secondary">2</span>
            </div>
            <span className="text-sm text-secondary">Review</span>
          </div>
          <div className="flex-1 h-px bg-outline-variant/40 max-w-[60px]" />
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-7 h-7 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center">
              <span className="text-xs font-bold text-secondary">3</span>
            </div>
            <span className="text-sm text-secondary">Done</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Card header accent */}
          <div className="px-6 sm:px-8 py-4 border-b border-outline-variant/30 bg-surface-container-low/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[18px]">
                person_add
              </span>
            </div>
            <div>
              <p className="font-semibold text-on-surface text-sm">
                Lead Information
              </p>
              <p className="text-xs text-secondary">
                All fields marked required must be filled
              </p>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <LeadForm
              onSubmit={onSubmit}
              isLoading={createMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
