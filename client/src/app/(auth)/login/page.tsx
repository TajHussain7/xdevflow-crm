"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Profile, ApiResponse } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.post<ApiResponse<{ profile: Profile }>>(
        "/auth/login",
        data,
      );
      setUser(response.data.data.profile);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error?.message ||
          "Authentication failed. Please verify your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center gradient-bg p-margin-mobile md:p-margin-desktop text-on-surface overflow-hidden relative">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-secondary/8 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] p-8 md:p-10 border border-surface-container-highest/60 relative overflow-hidden">
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-primary/70 to-secondary" />

          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <span className="material-symbols-outlined text-primary text-[28px]">
                hub
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-1.5 tracking-tight">
              XDevFlow
            </h1>
            <p className="font-body-md text-body-md text-secondary">
              Sign in to your CRM Engine
            </p>
          </div>

          {/* Error alert */}
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-error-container/80 text-on-error-container rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in border border-error/20">
              <span className="material-symbols-outlined text-[18px] text-error flex-shrink-0">
                warning_amber
              </span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="block font-label-md text-label-md text-on-surface"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors">
                  <span className="material-symbols-outlined text-secondary group-focus-within:text-primary text-[18px] transition-colors">
                    mail
                  </span>
                </div>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="sunken-input w-full pl-10 pr-3.5 py-2.5 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-body-md text-body-md text-on-surface placeholder-secondary/50 transition-all bg-surface-container-low/60"
                  placeholder="you@company.com"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-xs text-error flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[13px]">
                    error
                  </span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  className="block font-label-md text-label-md text-on-surface"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  href="#"
                  className="font-label-md text-label-md text-primary hover:text-primary/80 transition-colors text-xs"
                >
                  Forgot password?
                </Link>
              </div>
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
              {errors.password && (
                <p className="text-xs text-error flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[13px]">
                    error
                  </span>
                  {errors.password.message}
                </p>
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
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
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
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                Create one free
              </Link>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-secondary/60 mt-5">
          Secured by XDevFlow · Enterprise CRM Platform
        </p>
      </div>
    </div>
  );
}
