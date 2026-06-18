"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["admin", "manager", "user"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const roleDescriptions: Record<
  string,
  { label: string; description: string; icon: string }
> = {
  user: { label: "User", description: "View and create leads", icon: "person" },
  manager: {
    label: "Manager",
    description: "Edit and manage leads",
    icon: "manage_accounts",
  },
  admin: {
    label: "Admin",
    description: "Full platform access",
    icon: "shield_person",
  },
};

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "Min 8 characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number included", pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-error", "bg-warning", "bg-success"];
  const labels = ["Weak", "Fair", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score - 1] : "bg-outline-variant/40"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`text-[11px] flex items-center gap-1 ${c.pass ? "text-success" : "text-secondary"}`}
            >
              <span className="material-symbols-outlined text-[12px]">
                {c.pass ? "check_circle" : "radio_button_unchecked"}
              </span>
              {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span
            className={`text-[11px] font-semibold ${score === 3 ? "text-success" : score === 2 ? "text-warning" : "text-error"}`}
          >
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "user" },
  });

  const watchPassword = watch("password", "");
  const watchRole = watch("role", "user");

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post("/auth/register", data);
      setSuccessMsg("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setErrorMsg(
        (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ||
          "Registration failed. This email may already be in use.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center gradient-bg p-margin-mobile md:p-margin-desktop text-on-surface overflow-hidden relative">
      {/* Background orbs */}
      <div className="absolute top-[-8%] right-[-5%] w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-8%] left-[-5%] w-80 h-80 rounded-full bg-secondary/8 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 my-8">
        <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] p-8 md:p-10 border border-surface-container-highest/60 relative overflow-hidden">
          {/* Gradient bar */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-primary/70 to-secondary" />

          {/* Brand */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <span className="material-symbols-outlined text-primary text-[28px]">
                hub
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-1.5 tracking-tight">
              XDevFlow
            </h1>
            <p className="font-body-md text-body-md text-secondary">
              Create your CRM Account
            </p>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-error-container/80 text-on-error-container rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in border border-error/20">
              <span className="material-symbols-outlined text-[18px] text-error flex-shrink-0">
                warning_amber
              </span>
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-5 p-3.5 bg-status-qualified-bg/80 text-status-qualified-text rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in border border-status-qualified-text/20">
              <span className="material-symbols-outlined text-[18px] flex-shrink-0">
                check_circle
              </span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                className="block font-label-md text-label-md text-on-surface"
                htmlFor="full_name"
              >
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-secondary group-focus-within:text-primary text-[18px] transition-colors">
                    person
                  </span>
                </div>
                <input
                  id="full_name"
                  type="text"
                  {...register("full_name")}
                  className="sunken-input w-full pl-10 pr-3.5 py-2.5 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-body-md text-body-md text-on-surface placeholder-secondary/50 transition-all bg-surface-container-low/60"
                  placeholder="Tajamal Hussain"
                  required
                />
              </div>
              {errors.full_name && (
                <p className="text-xs text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">
                    error
                  </span>
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="block font-label-md text-label-md text-on-surface"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-secondary group-focus-within:text-primary text-[18px] transition-colors">
                    mail
                  </span>
                </div>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="sunken-input w-full pl-10 pr-3.5 py-2.5 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-body-md text-body-md text-on-surface placeholder-secondary/50 transition-all bg-surface-container-low/60"
                  placeholder="you@gmail.com"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-xs text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">
                    error
                  </span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                className="block font-label-md text-label-md text-on-surface"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-secondary group-focus-within:text-primary text-[18px] transition-colors">
                    lock
                  </span>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="sunken-input w-full pl-10 pr-11 py-2.5 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-body-md text-body-md text-on-surface placeholder-secondary/50 transition-all bg-surface-container-low/60"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary hover:text-on-surface transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <PasswordStrength password={watchPassword} />
              {errors.password && (
                <p className="text-xs text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">
                    error
                  </span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Workspace Role */}
            <div className="space-y-1.5">
              <label
                className="block font-label-md text-label-md text-on-surface"
                htmlFor="role"
              >
                Workspace Role
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-secondary group-focus-within:text-primary text-[18px] transition-colors">
                    badge
                  </span>
                </div>
                <select
                  id="role"
                  {...register("role")}
                  className="sunken-input w-full pl-10 pr-10 py-2.5 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-body-md text-body-md text-on-surface appearance-none cursor-pointer transition-all bg-surface-container-low/60"
                >
                  <option value="user">User (View and Create)</option>
                  <option value="manager">Manager (Edit Leads)</option>
                  <option value="admin">Admin (Full Control)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
              {/* Role description hint */}
              {watchRole && roleDescriptions[watchRole] && (
                <div className="flex items-center gap-2 text-xs text-secondary bg-surface-container/50 rounded-lg px-3 py-2 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    {roleDescriptions[watchRole].icon}
                  </span>
                  <span>{roleDescriptions[watchRole].description}</span>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-on-primary font-label-md text-label-md py-2.5 px-4 rounded-xl hover:bg-primary/90 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-7 pt-6 border-t border-outline-variant/30 text-center">
            <p className="font-body-md text-body-md text-secondary text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-secondary/60 mt-5">
          Secured by XDevFlow · Enterprise CRM Platform
        </p>
      </div>
    </div>
  );
}
