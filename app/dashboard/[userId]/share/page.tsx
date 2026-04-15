"use client";

import { ShareSection } from "@/components/dashboard/ShareSection";
import { useDashboard } from "@/hooks/use-dashboard-data";
import { Card, CardContent } from "@/components/ui/card";

export default function SharePage() {
  const { formData, creatorData, canAccessTab } = useDashboard();
  
  if (!creatorData) return null;

  if (!canAccessTab("share")) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-12 pb-12 text-center text-zinc-500">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-zinc-900">Scan Your Socials First</h3>
          <p className="text-sm">Complete a social media scan to generate your AI persona before sharing.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <ShareSection
      username={formData.username}
      accentColor={formData.accentColor}
      displayName={formData.displayName}
    />
  );
}
