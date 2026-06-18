"use client";

import { useEffect, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import api from "@/lib/api";
import type { Profile, Role } from "@/types";
import { getInitials } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, Award } from "lucide-react";

const roleStyles: Record<
  Role,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  admin: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    icon: <ShieldCheck size={11} />,
  },
  manager: {
    bg: "bg-status-qualified-bg",
    text: "text-status-qualified-text",
    border: "border-status-qualified-text/20",
    icon: <Award size={11} />,
  },
  user: {
    bg: "bg-surface-container",
    text: "text-secondary",
    border: "border-outline-variant/30",
    icon: <Award size={11} />,
  },
};

export default function AdminUsersPage() {
  const { isAdmin } = usePermissions();
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ data: Profile[] }>("/users");
      setUsers(res.data.data);
    } catch {
      setErrorMsg("Failed to load user directory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUsers();
    }
  }, [isAdmin]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setUpdatingId(userId);
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      alert(
        (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || "Failed to update user role.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-error-container/30 flex items-center justify-center mb-5 border border-error/20">
          <ShieldAlert size={36} className="text-error" />
        </div>
        <h3 className="text-headline-lg text-on-surface font-extrabold mb-2">
          Access Denied
        </h3>
        <p className="text-body-md text-secondary max-w-sm">
          You do not have administrative privileges to access this page. Contact
          your administrator for access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
            Administration
          </p>
          <h2 className="text-display-lg text-on-surface font-extrabold tracking-tight">
            User Management
          </h2>
          <p className="text-body-lg text-secondary mt-1">
            Configure organizational user access and role privileges.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-2.5 shadow-sm">
          <span className="material-symbols-outlined text-[18px] text-primary">
            group
          </span>
          <span className="font-semibold text-on-surface">{users.length}</span>
          <span>team members</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-error-container/80 text-on-error-container rounded-xl text-xs font-semibold flex items-center gap-2.5 border border-error/20">
          <span className="material-symbols-outlined text-[18px] text-error">
            warning_amber
          </span>
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl overflow-hidden shadow-sm">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border-b border-outline-variant/20 animate-pulse last:border-b-0"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-container flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-surface-container rounded w-1/4" />
                <div className="h-2.5 bg-surface-container rounded w-1/3" />
              </div>
              <div className="h-7 w-24 bg-surface-container rounded-lg" />
              <div className="h-7 w-28 bg-surface-container rounded-lg" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl text-center">
          <span className="material-symbols-outlined text-[44px] text-outline/40 mb-3">
            group
          </span>
          <p className="text-secondary font-body-md">
            No users found in the directory.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-3 bg-surface-container-low/60 border-b border-outline-variant/30">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
              User
            </span>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wide hidden sm:block">
              Email
            </span>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
              Role
            </span>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wide text-right">
              Change Role
            </span>
          </div>

          <div className="divide-y divide-outline-variant/20">
            {users.map((u) => {
              const style = roleStyles[u.role] || roleStyles.user;
              return (
                <div
                  key={u.id}
                  className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 items-center px-5 py-4 hover:bg-surface-container-low/40 transition-colors group"
                >
                  {/* User profile */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0 border border-primary/15">
                      {getInitials(u.full_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-on-surface text-sm leading-tight truncate">
                        {u.full_name}
                      </p>
                      <p className="text-xs text-secondary truncate sm:hidden">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <p className="text-secondary text-sm truncate hidden sm:block">
                    {u.email}
                  </p>

                  {/* Current role badge */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border} capitalize`}
                    >
                      {style.icon}
                      {u.role}
                    </span>
                  </div>

                  {/* Role select */}
                  <div className="flex justify-end">
                    <div className="relative">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u.id, e.target.value as Role)
                        }
                        disabled={updatingId === u.id}
                        className="rounded-xl border border-outline-variant pl-3 pr-8 py-1.5 bg-surface-container-low text-on-surface text-xs font-semibold focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:border-primary/50"
                      >
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[14px]">
                        {updatingId === u.id
                          ? "progress_activity"
                          : "expand_more"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
