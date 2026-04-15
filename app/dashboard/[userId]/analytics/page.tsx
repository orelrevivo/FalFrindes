"use client";

import { useState } from "react";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { useDashboard } from "@/hooks/use-dashboard-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AnalyticsSubTab = "overview" | "topics" | "activity";

export default function AnalyticsPage() {
  const { creatorData, canAccessTab } = useDashboard();
  const [activeSubTab, setActiveSubTab] = useState<AnalyticsSubTab>("overview");
  
  if (!creatorData) return null;

  if (!canAccessTab("analytics")) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-12 pb-12 text-center text-zinc-500">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-zinc-900">Analytics Locked</h3>
          <p className="text-sm mb-4">Upgrade to Standard or Pro to access analytics</p>
          <Button asChild>
            <a href="/pricing">View Plans →</a>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b-1 border-zinc-300">
        {(["overview", "topics", "activity"] as const).map((sub) => (
          <button
            key={sub}
            onClick={() => setActiveSubTab(sub)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeSubTab === sub
              ? "border-[#7C3AED] text-[#7C3AED]"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
              }`}
          >
            {sub.charAt(0).toUpperCase() + sub.slice(1)}
          </button>
        ))}
      </div>

      <AnalyticsSection
        creatorData={creatorData}
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
      />
    </div>
  );
}
