"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface SiteLayoutProps {
  children: ReactNode;
}

const pagesWithNavbar = ["/", "/explore", "/pricing", "/dashboard"];

export function SiteLayout({ children }: SiteLayoutProps) {
  const pathname = usePathname();
  
  const showNavbar = pagesWithNavbar.includes(pathname) || pathname.startsWith("/chat/") || pathname.startsWith("/dashboard/");
  
  const showPricing = !pathname.startsWith("/dashboard");
  
  if (!showNavbar) {
    return <>{children}</>;
  }
  
  return (
    <>
      <Navbar showPricing={showPricing} />
      <main className="flex-1">
        {children}
      </main>
    </>
  );
}