"use client";

import { useState } from "react";
import { APP_STYLES } from "./styles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileSectionProps {
  formData: any;
  setFormData: any;
  saving: boolean;
  setSaving: (v: boolean) => void;
  userId: string;
  onComplete: () => void;
}

export function ProfileSection({ formData, setFormData, saving, setSaving, userId, onComplete }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [promptValue, setPromptValue] = useState(formData.personaPrompt || "");

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/creator/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId: userId,
          displayName: formData.displayName,
          username: formData.username,
          accentColor: formData.accentColor,
          bio: formData.bio,
          speakingStyle: formData.speakingStyle,
          profilePhotoUrl: formData.profilePhotoUrl,
          aiTrainingPhotoUrl: formData.aiTrainingPhotoUrl,
        }),
      });
      if (response.ok) {
        onComplete();
        setIsEditing(false);
      }
    } catch (e) {
      console.error("Save failed", e);
    }
    setSaving(false);
  };

  const handleSavePrompt = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/creator/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId: userId,
          personaPrompt: promptValue,
        }),
      });
      if (response.ok) {
        onComplete();
        setIsEditingPrompt(false);
      }
    } catch (e) {
      console.error("Save prompt failed", e);
    }
    setSaving(false);
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        {isEditing ? (
          <>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="px-1">Edit Profile</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Back
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="displayName" className="mb-2 px-1">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="username" className="mb-2 px-1">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "") })}
                />
              </div>
              <div>
                <Label htmlFor="bio" className="mb-2 px-1">Bio</Label>
                <Textarea
                  id="bio"
                  className="max-h-40"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="profilePhotoUrl" className="mb-2 px-1">Profile Photo URL</Label>
                <Input
                  id="profilePhotoUrl"
                  type="url"
                  value={formData.profilePhotoUrl}
                  onChange={(e) => setFormData({ ...formData, profilePhotoUrl: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="aiTrainingPhotoUrl" className="mb-2 px-1">AI Reference Photo URL (Nano Banana Model)</Label>
                <Input
                  id="aiTrainingPhotoUrl"
                  type="url"
                  placeholder="Upload a clear photo of yourself for AI generation"
                  value={formData.aiTrainingPhotoUrl || ""}
                  onChange={(e) => setFormData({ ...formData, aiTrainingPhotoUrl: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="accentColor" className="mb-2 px-1">Accent Color</Label>
                <Input
                  id="accentColor"
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="h-10 cursor-pointer"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Profile</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  {formData.profilePhotoUrl ? (
                    <img src={formData.profilePhotoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xl text-muted-foreground">{formData.displayName?.[0] || "?"}</span>
                    </div>
                  )}
                  {formData.aiTrainingPhotoUrl && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#7C3AED] rounded-full border-2 border-white flex items-center justify-center shadow-sm" title="AI Training Photo Set">
                      <span className="text-[10px] text-white">📸</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{formData.displayName || "Your Name"}</h3>
                  <p className="text-sm text-muted-foreground">@{formData.username || "username"}</p>
                </div>
              </div>

              {formData.bio && (
                <div className="mb-4">
                  <Label className="text-xs text-muted-foreground">Bio</Label>
                  <p className="text-sm">{formData.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <p className="text-sm font-medium capitalize">{formData.scanStatus || "Not started"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Chat Link</Label>
                  <p className="text-sm font-medium text-[#7C3AED]">/chat/{formData.username}</p>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving || !formData.displayName || !formData.username}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </>
        )}
      </Card>

      {formData.personaPrompt && (
        <Card>
          {isEditingPrompt ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>AI Prompt</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsEditingPrompt(false)}>
                  Back
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="personaPrompt">Edit your AI persona prompt</Label>
                  <Textarea
                    id="personaPrompt"
                    value={promptValue}
                    onChange={(e) => setPromptValue(e.target.value)}
                    rows={10}
                    className="font-mono text-xs"
                  />
                </div>
                <Button
                  onClick={handleSavePrompt}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Prompt"}
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>AI Prompt</CardTitle>
                <Button variant="outline" size="sm" onClick={() => {
                  setPromptValue(formData.personaPrompt || "");
                  setIsEditingPrompt(true);
                }}>
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-3 max-h-48 overflow-y-auto">
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                    {formData.personaPrompt?.slice(0, 500)}
                    {formData.personaPrompt?.length > 500 ? "..." : ""}
                  </p>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      )}
    </div>
  );
}