"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function RootPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [user, router]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background ambient orbs — mirrors auth page aesthetic */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-secondary/6 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-primary/4 blur-[80px]" />
      </div>

      {/* Brand lockup */}
      <div className="relative z-10 flex flex-col items-center gap-6 select-none">
        {/* Logo mark */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.10)]">
            <span className="material-symbols-outlined text-primary text-[32px]">
              hub
            </span>
          </div>
          {/* Spinner ring around logo */}
          <div className="absolute -inset-1.5 rounded-[18px] border-2 border-primary/20 border-t-primary animate-spin" />
        </div>

        {/* Wordmark */}
        <div className="text-center">
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
            XDevFlow
          </h1>
          <p className="text-secondary text-body-md mt-1">
            Enterprise CRM Platform
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <p className="text-secondary text-xs tracking-wide">
          Loading CRM session...
        </p>
      </div>
    </div>
  );
}
