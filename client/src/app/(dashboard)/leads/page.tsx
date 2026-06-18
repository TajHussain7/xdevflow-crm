"use client";

import { useState } from "react";
import { useLeads, useDeleteLead } from "@/hooks/useLeads";
import LeadTable from "@/components/leads/LeadTable";
import LeadCard from "@/components/leads/LeadCard";
import { Search, Filter, Plus, List, Grid } from "lucide-react";
import Link from "next/link";
import type { LeadStatus } from "@/types";

const STATUS_OPTIONS: { value: LeadStatus | ""; label: string }[] = [
  { value: "", label: "All Stages" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
];

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { data: response, isLoading } = useLeads({
    search,
    status,
    page,
    limit: 10,
  });
  const deleteMutation = useDeleteLead();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as LeadStatus | "");
    setPage(1);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const totalLeads = response?.meta?.total ?? 0;
  const hasResults = response?.data && response.data.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
            Pipeline
          </p>
          <h2 className="text-display-lg text-on-surface font-extrabold tracking-tight">
            Leads
          </h2>
          <p className="text-body-lg text-secondary mt-1">
            Manage and track client communication stages.
          </p>
        </div>
        <Link
          href="/leads/new"
          className="flex items-center justify-center gap-2 bg-primary text-on-primary py-2.5 px-5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} />
          Create Lead
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by name, company, email..."
              value={search}
              onChange={handleSearchChange}
              className="w-full rounded-xl border border-outline-variant py-2.5 pl-10 pr-4 bg-surface-container-low text-on-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all placeholder-secondary/50"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  close
                </span>
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="relative flex items-center bg-surface-container-low rounded-xl border border-outline-variant px-3.5 py-2.5 gap-2 min-w-[180px]">
            <Filter size={14} className="text-secondary flex-shrink-0" />
            <select
              value={status}
              onChange={handleStatusChange}
              className="w-full bg-transparent border-none text-sm text-on-surface focus:ring-0 outline-none cursor-pointer appearance-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-[16px] text-secondary pointer-events-none flex-shrink-0">
              expand_more
            </span>
          </div>

          {/* Spacer + count + view toggle */}
          <div className="flex items-center gap-3 ml-auto">
            {!isLoading && (
              <span className="text-xs text-secondary hidden sm:block">
                <span className="font-semibold text-on-surface">
                  {totalLeads}
                </span>{" "}
                lead{totalLeads !== 1 ? "s" : ""}
                {status && (
                  <span className="ml-1">
                    in{" "}
                    <span className="text-primary font-semibold capitalize">
                      {STATUS_OPTIONS.find((o) => o.value === status)?.label}
                    </span>
                  </span>
                )}
              </span>
            )}
            <div className="h-5 w-px bg-outline-variant/40 hidden sm:block" />
            <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/50">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-primary-container text-on-primary-container shadow-sm"
                    : "text-secondary hover:bg-surface-container-low"
                }`}
                title="List view"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-primary-container text-on-primary-container shadow-sm"
                    : "text-secondary hover:bg-surface-container-low"
                }`}
                title="Grid view"
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Active filters strip */}
        {(search || status) && (
          <div className="flex items-center gap-2 px-4 pb-3 pt-0 border-t border-outline-variant/20 bg-surface-container/30">
            <span className="text-xs text-secondary">Filtering by:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium border border-primary/15">
                <span className="material-symbols-outlined text-[12px]">
                  search
                </span>
                &ldquo;{search}&rdquo;
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="hover:text-error transition-colors"
                >
                  <span className="material-symbols-outlined text-[12px]">
                    close
                  </span>
                </button>
              </span>
            )}
            {status && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium border border-primary/15 capitalize">
                <span className="material-symbols-outlined text-[12px]">
                  filter_list
                </span>
                {STATUS_OPTIONS.find((o) => o.value === status)?.label}
                <button
                  onClick={() => {
                    setStatus("");
                    setPage(1);
                  }}
                  className="hover:text-error transition-colors"
                >
                  <span className="material-symbols-outlined text-[12px]">
                    close
                  </span>
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
                setPage(1);
              }}
              className="ml-auto text-xs text-secondary hover:text-error transition-colors font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Leads output */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-surface-container rounded-2xl" />
          ))}
        </div>
      ) : hasResults ? (
        viewMode === "list" ? (
          <LeadTable
            leads={response.data}
            currentPage={page}
            totalPages={response.meta.totalPages}
            onPageChange={setPage}
            onDelete={handleDelete}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {response.data.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-outline-variant/60 rounded-2xl bg-surface-container-lowest">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4 border border-outline-variant/40">
            <span className="material-symbols-outlined text-[32px] text-outline/50">
              {search || status ? "search_off" : "person_search"}
            </span>
          </div>
          <h3 className="font-bold text-on-surface text-sm mb-1">
            {search || status ? "No leads match your filters" : "No leads yet"}
          </h3>
          <p className="text-secondary text-sm max-w-xs mb-5">
            {search || status
              ? "Try adjusting your search terms or clearing the active filters."
              : "Start building your pipeline by creating your first lead."}
          </p>
          {!search && !status ? (
            <Link
              href="/leads/new"
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus size={16} />
              Create First Lead
            </Link>
          ) : (
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
                setPage(1);
              }}
              className="flex items-center gap-2 text-primary text-sm font-semibold hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">
                filter_list_off
              </span>
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
