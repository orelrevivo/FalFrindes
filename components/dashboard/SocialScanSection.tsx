"use client";

import { useState } from "react";
import { APP_STYLES } from "./styles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const socialNetworks = [
  {
    id: "youtube",
    name: "YouTube",
    type: "image",
    icon: "https://cdn-icons-png.flaticon.com/128/1384/1384060.png",
    color: "#FF0000",
    placeholder: "https://youtube.com/@channel",
  },
  {
    id: "instagram",
    name: "Instagram",
    type: "image",
    icon: "https://cdn-icons-png.flaticon.com/128/174/174855.png",
    color: "#E4405F",
    placeholder: "https://instagram.com/handle",
  },
  {
    id: "tiktok",
    name: "TikTok",
    type: "image",
    icon: "https://cdn-icons-png.flaticon.com/128/3046/3046121.png",
    color: "#000000",
    placeholder: "https://tiktok.com/@handle",
  },
  {
    id: "twitter",
    name: "X / Twitter",
    type: "image",
    icon: "https://cdn-icons-png.flaticon.com/128/5968/5968958.png",
    color: "#000000",
    placeholder: "https://x.com/handle",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    type: "image",
    icon: "https://cdn-icons-png.flaticon.com/128/3536/3536505.png",
    color: "#0A66C2",
    placeholder: "https://linkedin.com/in/handle",
  },
  {
    id: "facebook",
    name: "Facebook",
    type: "image",
    icon: "https://cdn-icons-png.flaticon.com/128/5968/5968764.png",
    color: "#1877F2",
    placeholder: "https://facebook.com/handle",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    type: "image",
    icon: "https://cdn-icons-png.flaticon.com/128/15707/15707784.png",
    color: "#FFFC00",
    placeholder: "https://snapchat.com/add/handle",
  },
  {
    id: "twitch",
    name: "Twitch",
    type: "image",
    icon: "https://cdn-icons-png.flaticon.com/128/2111/2111668.png",
    color: "#9146FF",
    placeholder: "https://twitch.tv/handle",
  },
  {
    id: "discord",
    name: "Discord",
    type: "image",
    icon: "https://cdn-icons-png.flaticon.com/128/5968/5968756.png",
    color: "#5865F2",
    placeholder: "https://discord.gg/code",
  },
  {
    id: "reddit",
    name: "Reddit",
    type: "image",
    icon: "https://cdn-icons-png.flaticon.com/128/3670/3670226.png",
    color: "#FF4500",
    placeholder: "https://reddit.com/u/handle",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    type: "image",
    icon: "https://cdn-icons-png.flaticon.com/128/3536/3536559.png",
    color: "#BD081C",
    placeholder: "https://pinterest.com/handle",
  },
  {
    id: "spotify",
    name: "Spotify",
    type: "image",
    icon: "https://cdn-icons-png.flaticon.com/128/174/174872.png",
    color: "#1DB954",
    placeholder: "https://spotify.com/artist",
  },
];

interface SocialScanSectionProps {
  formData: any;
  setFormData: any;
  userId: string;
  onComplete: () => void;
}

export function SocialScanSection({ formData, setFormData, userId, onComplete }: SocialScanSectionProps) {
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<"idle" | "scanning" | "done">("idle");
  const [personaPrompt, setPersonaPrompt] = useState("");

  const [activeInputs, setActiveInputs] = useState<string[]>(() => {
    return socialNetworks.filter(n => formData[n.id]).map(n => n.id);
  });

  const toggleInput = (id: string) => {
    setActiveInputs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const startScan = async () => {
    setScanning(true);
    setStatus("scanning");

    const socialUrls: Record<string, string> = {};
    activeInputs.forEach(id => {
      if (formData[id]) socialUrls[id] = formData[id];
    });

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: userId,
          socialUrls,
          displayName: formData.displayName
        }),
      });

      const data = await response.json();
      if (data.personaPrompt) {
        setPersonaPrompt(data.personaPrompt);
        setStatus("done");
        onComplete?.();
      } else {
        setStatus("idle");
        alert(data.message || "Scan failed");
      }
    } catch {
      setStatus("idle");
    }
    setScanning(false);
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Social Scan</CardTitle>
          <CardDescription>Click icons to add your social media</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {socialNetworks.map((network) => {
              const isActive = activeInputs.includes(network.id);

              return (
                <button
                  key={network.id}
                  onClick={() => toggleInput(network.id)}
                  className={`p-2 rounded-xl border border-zinc-300 transition-all ${isActive
                    ? "border-gray-400 bg-gray-50"
                    : "border-border hover:border-gray-300"
                    }`}
                  title={network.name}
                >
                  <span className="text-xl block mb-1 flex justify-center items-center">
                    {network.type === "image" ? (
                      <img
                        src={network.icon}
                        alt={network.name}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      network.icon
                    )}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {network.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {activeInputs.map((id) => {
              const network = socialNetworks.find((n) => n.id === id);
              if (!network) return null;

              return (
                <div key={id}>
                  <Label className="flex items-center gap-2 mb-1">
                    <img
                      src={network.icon}
                      alt={network.name}
                      className="w-4 h-4 object-contain"
                    />
                    {network.name}
                  </Label>

                  <Input
                    type="url"
                    value={formData[id as keyof typeof formData] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [id]: e.target.value })
                    }
                    placeholder={network.placeholder}
                  />
                </div>
              );
            })}
          </div>

          {activeInputs.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">Click icons above to add your social media</p>
          )}

          <Button
            onClick={startScan}
            disabled={scanning || activeInputs.length === 0}
            className="w-full"
          >
            {scanning ? "Scanning..." : "Start Scan"}
          </Button>

          {status === "scanning" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin w-4 h-4 border-2 border-[#7C3AED] border-t-transparent rounded-full"></div>
              <span>Scanning your social media...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}