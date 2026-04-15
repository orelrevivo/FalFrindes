"use client";

import { useState } from "react";
import { APP_STYLES } from "./styles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ShareSectionProps {
  username: string;
  accentColor: string;
  displayName: string;
}

export function ShareSection({ username }: ShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${baseUrl}/chat/${username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!username) {
    return (
      <div className="w-full">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">🔗</span>
            </div>
            <p className="text-sm text-muted-foreground">Complete your profile first</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="w-13 h-13 rounded-full bg-black/5 flex items-center justify-center">
            <span className="text-lg text-white"><img src="/logo.png" alt="logo" /></span>
          </div>
          <div>
            <CardTitle>Share Your AI Twin</CardTitle>
            <CardDescription>Copy this link for your fans</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-[#7C3AED]/5 to-purple-50 rounded-md p-4">
            <p className="text-xs text-muted-foreground mb-1">Your share link</p>
            <p className="text-base font-semibold text-gray-900 break-all">{shareUrl}</p>
          </div>

          <Button
            onClick={handleCopy}
            className="w-full gap-2"
          >
            {copied ? (
              <>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <span>Copy Link</span>
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground pt-2 border-t">
            Paste this link in your Instagram bio, YouTube description, TikTok bio, or anywhere!
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#7C3AED]">✓</span>
              <span>Each fan gets their own private chat</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#7C3AED]">✓</span>
              <span>Chats are saved automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#7C3AED]">✓</span>
              <span>When they come back, they continue where they left off</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}