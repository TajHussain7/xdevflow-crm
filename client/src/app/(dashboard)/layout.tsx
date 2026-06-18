"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isAdmin } = usePermissions();

  const isLeadProfile = pathname.match(/^\/leads\/[a-zA-Z0-9-]+$/);
  const isLeadEdit = pathname.match(/^\/leads\/[a-zA-Z0-9-]+\/edit$/);
  const isLeadNew = pathname === "/leads/new";
  const isFocusedPage = isLeadProfile || isLeadEdit || isLeadNew;

  if (isFocusedPage) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  const bottomNavItems = [
    { label: "Dashboard", href: "/dashboard", iconName: "dashboard" },
    { label: "Leads", href: "/leads", iconName: "filter_list" },
    ...(isAdmin
      ? [{ label: "Admin", href: "/admin/users", iconName: "settings" }]
      : []),
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main workspace */}
      <div className="flex-1 flex flex-col md:pl-[240px] min-h-screen pb-24 md:pb-0">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-8 animate-fade-in">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface-container-highest/95 backdrop-blur-xl shadow-[0_-1px_0_rgba(0,0,0,0.08),0_-8px_24px_rgba(0,0,0,0.10)] rounded-t-2xl border-t border-outline-variant/20">
        <div className="flex justify-around items-center px-2 py-2 pb-safe">
          {bottomNavItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95",
                  active
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {/* Active indicator pill */}
                {active && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-7 rounded-full bg-primary-container -z-0" />
                )}
                <span
                  className={cn(
                    "material-symbols-outlined text-[22px] relative z-10 transition-all",
                    active && "icon-fill",
                  )}
                >
                  {item.iconName}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold mt-0.5 tracking-tight relative z-10",
                    active ? "text-primary" : "text-on-surface-variant",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
