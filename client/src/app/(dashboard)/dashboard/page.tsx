"use client";

import { useDashboardStats } from "@/hooks/useDashboard";
import { useLeads } from "@/hooks/useLeads";
import StatCard from "@/components/dashboard/StatCard";
import PipelineChart from "@/components/dashboard/PipelineChart";
import LeadStatusBadge from "@/components/leads/LeadStatusBadge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: leadsResponse, isLoading: leadsLoading } = useLeads({
    limit: 8,
  });

  const isLoading = statsLoading || leadsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-9 bg-surface-container rounded-xl w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-container rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-surface-container rounded-2xl" />
          <div className="h-80 bg-surface-container lg:col-span-2 rounded-2xl" />
        </div>
      </div>
    );
  }

  const leads = leadsResponse?.data || [];

  return (
    <div className="flex flex-col gap-gutter">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
            Overview
          </p>
          <h2 className="font-display-lg text-display-lg text-on-background">
            Dashboard
          </h2>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Pipeline performance and recent activity at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex bg-surface-container-lowest rounded-xl p-1 shadow-sm border border-outline-variant/50">
            <button className="px-3.5 py-1.5 text-label-md font-label-md rounded-lg bg-primary text-on-primary shadow-sm transition-all">
              30 Days
            </button>
            <button className="px-3.5 py-1.5 text-label-md font-label-md rounded-lg text-secondary hover:bg-surface-container-low transition-colors">
              90 Days
            </button>
            <button className="px-3.5 py-1.5 text-label-md font-label-md rounded-lg text-secondary hover:bg-surface-container-low transition-colors">
              YTD
            </button>
          </div>
          <Link
            href="/leads/new"
            className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Lead
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={stats?.total_leads ?? 0}
          iconName="group"
          iconColor="text-primary bg-primary/10"
          orbColor="bg-primary/5"
          trend={{ value: "+12.5% vs last month", positive: true }}
        />
        <StatCard
          title="New"
          value={stats?.new_leads ?? 0}
          iconName="fiber_new"
          iconColor="text-status-new-text bg-status-new-bg"
          orbColor="bg-status-new-bg"
          trend={{ value: "+4.2% vs last month", positive: true }}
        />
        <StatCard
          title="Qualified"
          value={stats?.qualified_leads ?? 0}
          iconName="verified"
          iconColor="text-status-qualified-text bg-status-qualified-bg"
          orbColor="bg-status-qualified-bg"
          trend={{ value: "-2.1% vs last month", positive: false }}
        />
        <StatCard
          title="Closed"
          value={stats?.closed_leads ?? 0}
          iconName="monetization_on"
          iconColor="text-status-won-text bg-status-won-bg"
          orbColor="bg-status-won-bg"
          trend={{ value: "+18.3% vs last month", positive: true }}
        />
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Health */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/50 flex flex-col col-span-1 overflow-hidden">
          <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/40">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-background font-bold">
                Pipeline Health
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Stage distribution
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">
                donut_large
              </span>
            </div>
          </div>
          {stats?.pipeline_breakdown ? (
            <PipelineChart data={stats.pipeline_breakdown} />
          ) : (
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-secondary gap-3">
              <span className="material-symbols-outlined text-[40px] text-outline/50">
                bar_chart
              </span>
              <p className="font-body-md text-sm">No pipeline data yet</p>
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/50 flex flex-col col-span-1 lg:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/40">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-background font-bold">
                Recent Leads
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Latest pipeline activity
              </p>
            </div>
            <Link
              href="/leads"
              className="flex items-center gap-1.5 text-primary font-label-md text-label-md text-xs hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              View All
              <span className="material-symbols-outlined text-[14px]">
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/50 font-label-md text-label-md text-secondary border-b border-outline-variant/20">
                  <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wide">
                    Contact
                  </th>
                  <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wide">
                    Status
                  </th>
                  <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wide">
                    Last Activity
                  </th>
                  <th className="py-3 px-5 font-semibold text-xs uppercase tracking-wide text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-outline-variant/20">
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-[40px] text-outline/40">
                          person_search
                        </span>
                        <p className="text-secondary text-sm">No leads yet.</p>
                        <Link
                          href="/leads/new"
                          className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            add_circle
                          </span>
                          Create your first lead
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
                {leads.map((lead) => {
                  const initials = lead.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-surface-container-low/40 transition-colors group"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 border border-primary/15">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-on-background text-sm leading-tight">
                              {lead.company || lead.full_name}
                            </div>
                            <div className="text-xs text-secondary mt-0.5">
                              {lead.full_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="py-3.5 px-5 text-secondary text-xs">
                        {formatDistanceToNow(
                          new Date(lead.updated_at || lead.created_at),
                          { addSuffix: true },
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="inline-flex items-center gap-1.5 text-secondary group-hover:text-primary transition-colors px-2.5 py-1.5 rounded-lg group-hover:bg-primary/10 text-xs font-semibold"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            open_in_new
                          </span>
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
