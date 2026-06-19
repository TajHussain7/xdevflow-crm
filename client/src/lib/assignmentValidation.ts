/**
 * Lead assignment validation helper
 * Ensures only valid users can be assigned to leads
 */

import type { Profile } from "@/types";

export const isValidAssignee = (user: Profile | null | undefined): boolean => {
  if (!user) return false;
  // Managers and admins can be assigned to leads
  return ["manager", "admin"].includes(user.role ?? "");
};

export const getAssignableUsers = (users: Profile[]): Profile[] => {
  // Only return managers and admins as assignable users
  return users.filter((u) => ["manager", "admin"].includes(u.role ?? ""));
};

export const validateLeadAssignment = (
  assignedToId: string | undefined,
  users: Profile[],
): { valid: boolean; error?: string } => {
  if (!assignedToId) {
    // Empty assignment is valid (unassigned)
    return { valid: true };
  }

  const user = users.find((u) => u.id === assignedToId);

  if (!user) {
    return {
      valid: false,
      error: "Selected user not found.",
    };
  }

  if (!isValidAssignee(user)) {
    return {
      valid: false,
      error: "Only managers and administrators can be assigned to leads.",
    };
  }

  return { valid: true };
};
