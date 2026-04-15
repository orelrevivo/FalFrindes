"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

interface Creator {
  id: string;
  displayName: string;
  profilePhotoUrl: string;
  accentColor: string;
  bio: string;
  personaPrompt: string;
  scanStatus: string;
}

function getOrCreateChatId(username: string): string {
  if (typeof window === "undefined") return "";
  
  const key = `chat_${username}`;
  const existing = localStorage.getItem(key);
  
  if (existing) return existing;
  
  const newId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  localStorage.setItem(key, newId);
  return newId;
}

function hasSeenIntro(username: string): boolean {
  if (typeof window === "undefined") return false;
  const key = `intro_seen_${username}`;
  return localStorage.getItem(key) === "true";
}

function setIntroSeen(username: string): void {
  if (typeof window === "undefined") return;
  const key = `intro_seen_${username}`;
  localStorage.setItem(key, "true");
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [credits, setCredits] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const introSentRef = useRef(false);

  useEffect(() => {
    if (username) {
      const chatId = getOrCreateChatId(username);
      setSessionId(chatId);
      loadData();
    }
  }, [username]);

  async function loadData() {
    try {
      setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(`/api/creator/${username}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        setError("Creator not found");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCreator(data);
      
      const userRes = await fetch("/api/user/credits");
      if (userRes.ok) {
        const userData = await userRes.json();
        setCredits(userData.credits);
      }

      setLoading(false);
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") {
        setError("Failed to load");
      }
      setLoading(false);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (creator && !introSentRef.current && messages.length === 0) {
      if (hasSeenIntro(username)) {
        return;
      }
      
      introSentRef.current = true;
      setIntroSeen(username);
      
      setTimeout(() => {
        const introMessage = creator.personaPrompt 
          ? `Hi there! I'm ${creator.displayName || "the creator"}'s AI. I'm trained to answer your questions and chat with you just like they would! Ask me anything!`
          : `Hi! I'm ${creator.displayName || "the creator"}'s AI assistant. I'm still being trained, but I'm here to chat with you!`;
        
        setMessages([{ role: "assistant", content: introMessage }]);
      }, 300);
    }
  }, [creator, messages.length, username]);

  const sendMessage = async () => {
    if (!input.trim() || !creator || !sessionId) return;

    if (credits !== null && credits !== "Unlimited") {
      const currentCredits = parseFloat(credits);
      if (isNaN(currentCredits) || currentCredits < 0.01) {
        setError("Not enough credits. Please upgrade your plan!");
        router.push("/pricing");
        return;
      }
    }
    
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    const msgToSend = input;
    setInput("");
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorUsername: username,
          messages: [...messages, userMessage],
          sessionId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 402) {
          setError("Not enough credits. Please upgrade!");
          router.push("/pricing");
        } else {
          setError(err.message || "Failed");
        }
        setSending(false);
        return;
      }

      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: data.message,
          imageUrl: data.imageUrl 
        }]);
      }

      if (data.error) {
         setError(`Engine Error: ${data.error}`);
      }

      // If image was requested but not returned, show a warning in the console/UI
      if (data.debug && data.debug.isImageRequest && !data.imageUrl) {
         console.warn("Nano Banana failed to return an image:", data.debug);
         setMessages(prev => [...prev, {
            role: "assistant",
            content: "⚠️ I tried to generate a photo for you, but the engine is currently experiencing high load. Please try again in a moment!"
         }]);
      }

      if (data.creditsUsed && credits) {
        const currentCredits = parseFloat(credits);
        setCredits((currentCredits - data.creditsUsed).toFixed(2));
      }
    } catch (e) {
      setError("Failed");
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const shareChat = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Link copied!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-7 h-7 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 flex items-center justify-center">
            <span className="text-2xl">😕</span>
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 mb-1">Oops!</h1>
          <p className="text-sm text-zinc-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-7 h-7 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header 
        className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: creator.accentColor }}
      >
        <div className="flex items-center gap-3">
          {creator.profilePhotoUrl ? (
            <img 
              src={creator.profilePhotoUrl} 
              alt={creator.displayName}
              className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
              <span className="text-white text-sm font-semibold">
                {creator.displayName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-white font-semibold text-sm">{creator.displayName}</h1>
            <p className="text-white/70 text-xs">AI Twin</p>
          </div>
        </div>
        <button
          onClick={shareChat}
          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </header>

      <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100 flex justify-center">
        <span className="text-xs text-zinc-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Powered by AI — Not the real person
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-xl mx-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center">
                <span className="text-xl">👋</span>
              </div>
              <p className="text-sm text-zinc-600 mb-1">Say hi to {creator.displayName}!</p>
              <p className="text-xs text-zinc-400">Start the conversation</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[85%] space-y-2 ${
                  msg.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"
                }`}
              >
                <div 
                  className={`px-4 py-2.5 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-zinc-900 text-white rounded-br-sm shadow-sm"
                      : "bg-zinc-100 text-zinc-900 rounded-bl-sm shadow-sm border border-zinc-200"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-lg bg-zinc-50 max-w-full group relative transition-transform hover:scale-[1.01]">
                    <img 
                      src={msg.imageUrl} 
                      alt="AI Preview" 
                      className="max-w-full h-auto object-contain cursor-zoom-in"
                      onClick={() => window.open(msg.imageUrl, '_blank')}
                    />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement('a');
                          link.href = msg.imageUrl || "";
                          link.download = `selfie-${Date.now()}.png`;
                          link.click();
                        }}
                        className="bg-black/50 backdrop-blur-md p-2 rounded-lg text-white hover:bg-black/70 transition-colors"
                        title="Download Photo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-white flex items-center">
                        Nano Banana Engine
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {sending && (
            <div className="flex justify-start">
              <div className="bg-zinc-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-3 border-t border-zinc-100">
        <div className="max-w-xl mx-auto flex items-end gap-2 bg-zinc-50 rounded-2xl p-1.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-3 py-2.5 bg-white rounded-xl border-0 text-sm resize-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
            style={{ maxHeight: "100px" }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="p-2.5 rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}