"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Profile, LeadStatus, CreateLeadInput } from "@/types";

const leadFormSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100),
  email: z.string().email("Must be a valid email address"),
  phone: z
    .string()
    .min(7, "Phone number too short")
    .max(20, "Phone number too long"),
  company: z.string().min(1, "Company is required").max(100),
  status: z.enum([
    "new",
    "contacted",
    "qualified",
    "proposal",
    "closed_won",
    "closed_lost",
  ]),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
  assigned_to: z.string().uuid("Please select a valid user").or(z.literal("")),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  initialValues?: Partial<LeadFormValues>;
  onSubmit: (data: CreateLeadInput) => void;
  isLoading?: boolean;
}

export default function LeadForm({
  initialValues,
  onSubmit,
  isLoading,
}: LeadFormProps) {
  const [users, setUsers] = useState<Profile[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      full_name: initialValues?.full_name || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      company: initialValues?.company || "",
      status: initialValues?.status || "new",
      notes: initialValues?.notes || "",
      assigned_to: initialValues?.assigned_to || "",
    },
  });

  // Fetch users for assignment dropdown
  useEffect(() => {
    api
      .get<{ data: Profile[] }>("/users")
      .then((res) => setUsers(res.data.data))
      .catch((err) =>
        console.error("Failed to load users for assignment:", err),
      );
  }, []);

  const handleFormSubmit = (values: LeadFormValues) => {
    // Convert empty string for assigned_to to undefined/null
    const submitData: CreateLeadInput = {
      ...values,
      assigned_to: values.assigned_to === "" ? undefined : values.assigned_to,
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
            Full Name
          </label>
          <input
            type="text"
            {...register("full_name")}
            className="w-full rounded-lg border border-outline-variant p-2.5 bg-surface-container-lowest text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md"
            placeholder="Tajamal Hussain"
          />
          {errors.full_name && (
            <p className="mt-1 text-xs text-error">
              {errors.full_name.message}
            </p>
          )}
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
            Company Name
          </label>
          <input
            type="text"
            {...register("company")}
            className="w-full rounded-lg border border-outline-variant p-2.5 bg-surface-container-lowest text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md"
            placeholder="Systems Limited"
          />
          {errors.company && (
            <p className="mt-1 text-xs text-error">{errors.company.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
            Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full rounded-lg border border-outline-variant p-2.5 bg-surface-container-lowest text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md"
            placeholder="hussaintajamal@gmail.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-error">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
            Phone Number
          </label>
          <input
            type="text"
            {...register("phone")}
            className="w-full rounded-lg border border-outline-variant p-2.5 bg-surface-container-lowest text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md"
            placeholder="+92 343 8002540"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-error">{errors.phone.message}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
            Lead Status
          </label>
          <select
            {...register("status")}
            className="w-full rounded-lg border border-outline-variant p-2.5 bg-surface-container-lowest text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-xs text-error">{errors.status.message}</p>
          )}
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
            Assign Team Member
          </label>
          <select
            {...register("assigned_to")}
            className="w-full rounded-lg border border-outline-variant p-2.5 bg-surface-container-lowest text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({user.role})
              </option>
            ))}
          </select>
          {errors.assigned_to && (
            <p className="mt-1 text-xs text-error">
              {errors.assigned_to.message}
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-2">
          Notes & Context
        </label>
        <textarea
          {...register("notes")}
          rows={4}
          className="w-full rounded-lg border border-outline-variant p-2.5 bg-surface-container-lowest text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md"
          placeholder="Include details about initial contact, company background..."
        />
        {errors.notes && (
          <p className="mt-1 text-xs text-error">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-5 py-2.5 rounded-lg border border-outline-variant text-secondary hover:bg-surface-container transition-colors font-medium text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container disabled:opacity-50 transition-colors font-medium text-sm shadow-sm"
        >
          {isLoading ? "Saving..." : "Save Lead"}
        </button>
      </div>
    </form>
  );
}
