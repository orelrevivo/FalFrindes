"use client";

import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { useDashboard } from "@/hooks/use-dashboard-data";
import { useUser } from "@clerk/nextjs";

export default function ProfilePage() {
  const { user } = useUser();
  const { formData, setFormData, saving, setSaving, loadCreator, loading } = useDashboard();
  
  if (loading) return null;
  
  return (
    <ProfileSection
      formData={formData}
      setFormData={setFormData}
      saving={saving}
      setSaving={setSaving}
      userId={user?.id || ""}
      onComplete={loadCreator}
    />
  );
}
