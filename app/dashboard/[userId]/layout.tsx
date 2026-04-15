"use client";

import { useUser } from "@clerk/nextjs";
import { DashboardProvider, useDashboard } from "@/hooks/use-dashboard-data";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile", label: "Profile", path: "/profile" },
  { id: "scan", label: "Social Scan", path: "/scan" },
  { id: "share", label: "Share", path: "/share" },
  { id: "analytics", label: "Analytics", path: "/analytics" },
];

function DashboardNav() {
  const pathname = usePathname();
  const params = useParams();
  const userId = params.userId as string;
  const { canAccessTab, loading } = useDashboard();

  if (loading) return null;

  const activeTabId = TABS.find(tab => pathname.endsWith(tab.path))?.id || "profile";
  const activeTabIndex = TABS.findIndex(t => t.id === activeTabId);

  return (
    <div className="tab-container relative flex items-center bg-zinc-200 mb-2 rounded-lg p-[2px] w-fit">
      {/* INDICATOR */}
      <div
        className="indicator absolute top-[2px] left-[2px] h-[28px] w-[130px] bg-white rounded-md shadow transition-all duration-200"
        style={{
          transform: `translateX(${activeTabIndex * 130}px)`,
        }}
      />

      {TABS.map((tab) => {
        const disabled = !canAccessTab(tab.id);
        const isActive = activeTabId === tab.id;

        return (
          <Link
            key={tab.id}
            href={disabled ? "#" : `/dashboard/${userId}${tab.path}`}
            className={cn(
              "relative z-10 w-[130px] h-[28px] text-xs font-medium transition-opacity flex items-center justify-center transition-colors",
              isActive ? "text-black" : "text-zinc-500",
              disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { loading } = useDashboard();
  
  if (loading) {
    return (
       <div className="flex items-center justify-center py-12">
         <div className="animate-spin w-6 h-6 border-3 border-[#7C3AED] border-t-transparent rounded-full" />
       </div>
    );
  }

  return (
    <div className="w-full">
      {children}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const params = useParams();
  
  if (user && params.userId && user.id !== params.userId) {
     return <div>Unauthorized</div>;
  }

  return (
    <DashboardProvider>
      <div
        className="min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-2.png')" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-5 font-miso">
          <DashboardNav />
          <ContentWrapper>
            {children}
          </ContentWrapper>
        </div>
      </div>
    </DashboardProvider>
  );
}
