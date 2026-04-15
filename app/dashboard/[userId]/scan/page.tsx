"use client";

import { SocialScanSection } from "@/components/dashboard/SocialScanSection";
import { useDashboard } from "@/hooks/use-dashboard-data";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";

export default function ScanPage() {
  const { user } = useUser();
  const { formData, setFormData, loadCreator, canAccessTab, loading } = useDashboard();
  
  if (loading) return null;

  if (!canAccessTab("scan")) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-12 pb-12 text-center text-zinc-500">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-zinc-900">Complete Your Profile First</h3>
          <p className="text-sm">You need to set your display name and username before scanning social media.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <SocialScanSection
      formData={formData}
      setFormData={setFormData}
      userId={user?.id || ""}
      onComplete={loadCreator}
    />
  );
}
