"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavbarProps {
  showPricing?: boolean;
  credits?: string;
}

export function Navbar({ showPricing = true, credits = "0.20" }: NavbarProps) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [currentCredits, setCurrentCredits] = useState(credits);

  useEffect(() => {
    if (user) {
      fetch("/api/user/credits")
        .then(res => res.json())
        .then(data => {
          setCurrentCredits(data.credits || "0.20");
        })
        .catch(() => { });
    }
  }, [user, pathname]);

  const isDashboard = pathname === "/dashboard";
  const isPricing = pathname === "/pricing";

  if (!isLoaded) {
    return (
      <header className="bg-white border-b border-zinc-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-10">
          <div className="w-20 h-6 bg-zinc-100 animate-pulse rounded"></div>
          <div className="w-20 h-8 bg-zinc-100 animate-pulse rounded-full"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-zinc-100 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href={user ? `/dashboard/${user.id}/profile` : "/"} className="flex items-center gap-2">
          <h1
            className="flex items-center text-lg font-bold text-zinc-900"
          >
            <img
              className="w-10 h-10"
              src="/logo.png"
              alt="logo"
            />
            <span>
              <span className="font-bold text-[#7C3AED]">F</span>
              al
              <span className="font-bold text-[#7C3AED]">F</span>
              rindes
            </span>
          </h1>
        </Link>

        <div className="flex items-center gap-3">
          {showPricing && (
            <Link
              href="/pricing"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${isPricing
                ? "bg-[#7C3AED] text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
            >
              Pricing
            </Link>
          )}

          {user && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 rounded-lg">
              <span className="text-xs">🪙</span>
              <span className="text-xs font-medium text-zinc-700">{currentCredits}</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              {isDashboard && (
                <Link
                  href="/explore"
                  className="text-xs text-zinc-500 hover:text-zinc-900"
                >
                  Explore
                </Link>
              )}
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in" className="text-xs text-zinc-500 hover:text-zinc-900">
                Sign In
              </Link>
              {isPricing && (
                <Link href={user ? `/dashboard/${user.id}/profile` : "/dashboard"} className="text-xs font-medium text-[#7C3AED] hover:underline">
                  Dashboard →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}