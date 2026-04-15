"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

interface DashboardContextType {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  creatorData: any;
  loading: boolean;
  saving: boolean;
  setSaving: (v: boolean) => void;
  loadCreator: () => Promise<void>;
  isNewUser: boolean;
  credits: string;
  subscriptionPlan: string;
  canAccessTab: (tabId: string) => boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [saving, setSaving] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [creatorData, setCreatorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState("0.20");
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");

  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    accentColor: "#7C3AED",
    bio: "",
    speakingStyle: "",
    profilePhotoUrl: "",
    personaPrompt: "",
    aiTrainingPhotoUrl: "",
    youtube: "",
    instagram: "",
    tiktok: "",
    twitter: "",
    linkedin: "",
    facebook: "",
    snapchat: "",
    twitch: "",
    discord: "",
    reddit: "",
    pinterest: "",
    spotify: "",
  });

  const loadCreator = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const res = await fetch(`/api/creator/by-user/${user.id}`);
      
      if (res.ok) {
        const data = await res.json();
        setCreatorData(data);
        setCredits(data.credits || "0.20");
        setSubscriptionPlan(data.subscriptionPlan || "free");

        let socialUrls: Record<string, string> = {};
        if (typeof data.socialUrls === "string") {
          try { socialUrls = JSON.parse(data.socialUrls); } catch { }
        } else if (data.socialUrls && typeof data.socialUrls === "object") {
          socialUrls = data.socialUrls;
        }

        setFormData(prev => ({
          ...prev,
          displayName: data.displayName || "",
          username: data.username || "",
          accentColor: data.accentColor || "#7C3AED",
          bio: data.bio || "",
          speakingStyle: data.speakingStyle || "",
          profilePhotoUrl: data.profilePhotoUrl || "",
          personaPrompt: data.personaPrompt || "",
          aiTrainingPhotoUrl: data.aiTrainingPhotoUrl || "",
          ...socialUrls,
        }));

        const plan = data.subscriptionPlan || "free";
        if (data.username && data.scanStatus === "done" && (plan === "standard" || plan === "pro")) {
          setIsNewUser(false);
        }
      }
    } catch (e) {
      console.error("Failed to load creator", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isLoaded && user?.id) {
      loadCreator();
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [isLoaded, user?.id, loadCreator]);

  return (
    <DashboardContext.Provider value={{
      formData,
      setFormData,
      creatorData,
      loading,
      saving,
      setSaving,
      loadCreator,
      isNewUser,
      credits,
      subscriptionPlan,
      canAccessTab: (tabId: string) => {
        if (tabId === "profile") return true;
        if (tabId === "scan") return formData.displayName && formData.username;
        if (tabId === "share") return formData.displayName && formData.username && creatorData?.scanStatus === "done";
        if (tabId === "analytics") return !isNewUser && (subscriptionPlan === "standard" || subscriptionPlan === "pro");
        return false;
      }
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
