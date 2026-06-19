"use client";

import { useState } from "react";
import { useUpdateLead } from "@/hooks/useLeads";
import { usePermissions } from "@/hooks/usePermissions";
import type { Lead, LeadStatus } from "@/types";
import LeadStatusBadge from "./LeadStatusBadge";
import { ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

interface LeadStatusTransitionProps {
  lead: Lead;
  onSuccess?: () => void;
}

const STATUS_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ["contacted", "closed_lost"],
  contacted: ["qualified", "closed_lost"],
  qualified: ["proposal", "closed_lost"],
  proposal: ["closed_won", "closed_lost"],
  closed_won: [],
  closed_lost: [],
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

export default function LeadStatusTransition({
  lead,
  onSuccess,
}: LeadStatusTransitionProps) {
  const { canEdit, isManager, isAdmin } = usePermissions();
  const updateMutation = useUpdateLead();
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const availableTransitions = STATUS_TRANSITIONS[lead.status] || [];
  const canTransition =
    (canEdit || isManager || isAdmin) && availableTransitions.length > 0;

  const handleStatusChange = (newStatus: LeadStatus) => {
    setSelectedStatus(newStatus);
    setIsConfirming(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const confirmTransition = () => {
    if (!selectedStatus) return;

    updateMutation.mutate(
      { id: lead.id, data: { status: selectedStatus } },
      {
        onSuccess: () => {
          setSuccessMsg(
            `Lead moved to "${STATUS_LABELS[selectedStatus]}" successfully!`,
          );
          setIsConfirming(false);
          setSelectedStatus(null);
          setTimeout(() => {
            setSuccessMsg(null);
            onSuccess?.();
          }, 2000);
        },
        onError: (err) => {
          setErrorMsg(
            (err as { response?: { data?: { error?: { message?: string } } } })
              .response?.data?.error?.message ||
              "Failed to update lead status. Please try again.",
          );
          setIsConfirming(false);
        },
      },
    );
  };

  const cancelTransition = () => {
    setIsConfirming(false);
    setSelectedStatus(null);
    setErrorMsg(null);
  };

  if (!canTransition) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-status-proposal-bg/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-status-proposal-text text-[18px]">
              lock
            </span>
          </div>
          <div>
            <p className="font-semibold text-on-surface text-sm">
              Pipeline Locked
            </p>
            <p className="text-secondary text-xs">
              {lead.status === "closed_won" || lead.status === "closed_lost"
                ? "This lead has reached a final state and cannot be modified."
                : "Only managers and administrators can update the lead status."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
            Pipeline Management
          </p>
          <h3 className="text-headline-md font-bold text-on-surface">
            Move Lead Through Pipeline
          </h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-[20px]">
            trending_up
          </span>
        </div>
      </div>

      {/* Current Status */}
      <div className="flex items-center gap-3 p-4 bg-surface-container/50 rounded-xl border border-outline-variant/30">
        <span className="text-xs font-semibold text-secondary uppercase tracking-widest">
          Current Stage
        </span>
        <LeadStatusBadge status={lead.status} />
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-error-container/30 border border-error/30 rounded-xl">
          <AlertCircle size={16} className="text-error flex-shrink-0" />
          <p className="text-xs font-medium text-error">{errorMsg}</p>
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-success-fixed/20 border border-success-fixed/30 rounded-xl animate-fade-in">
          <CheckCircle size={16} className="text-success-fixed flex-shrink-0" />
          <p className="text-xs font-medium text-success-fixed">{successMsg}</p>
        </div>
      )}

      {/* Confirmation Mode */}
      {isConfirming && selectedStatus ? (
        <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <LeadStatusBadge status={lead.status} />
              <ArrowRight size={16} className="text-primary" />
              <LeadStatusBadge status={selectedStatus} />
            </div>
          </div>
          <p className="text-xs text-secondary">
            Move this lead from{" "}
            <span className="font-semibold text-on-surface">
              {STATUS_LABELS[lead.status]}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-on-surface">
              {STATUS_LABELS[selectedStatus]}
            </span>
            ? This action will be logged in the activity timeline.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={cancelTransition}
              disabled={updateMutation.isPending}
              className="px-4 py-2 rounded-lg border border-outline-variant text-secondary hover:bg-surface-container/50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmTransition}
              disabled={updateMutation.isPending}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                  Updating...
                </>
              ) : (
                <>
                  <ArrowRight size={14} />
                  Confirm Move
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Transition Options */
        <div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-3">
            Next Stages
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableTransitions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updateMutation.isPending}
                className="relative group p-3 rounded-xl border border-outline-variant/50 bg-surface-container-low hover:bg-surface-container hover:border-primary/50 transition-all text-sm font-medium text-on-surface disabled:opacity-50"
              >
                {status === "closed_won" && (
                  <span className="material-symbols-outlined text-[18px] block text-success-fixed mb-1">
                    check_circle
                  </span>
                )}
                {status === "closed_lost" && (
                  <span className="material-symbols-outlined text-[18px] block text-error mb-1">
                    cancel
                  </span>
                )}
                {!["closed_won", "closed_lost"].includes(status) && (
                  <span className="material-symbols-outlined text-[18px] block text-primary mb-1">
                    arrow_forward
                  </span>
                )}
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
          <p className="text-xs text-secondary mt-3">
            Click a stage to move the lead through your sales pipeline.
          </p>
        </div>
      )}
    </div>
  );
}
