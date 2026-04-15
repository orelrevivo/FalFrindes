"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Creator {
  id: string;
  username: string;
  displayName: string;
  profilePhotoUrl: string;
  bio: string;
  accentColor: string;
}

export default function ExplorePage() {
  const { user, isLoaded } = useUser();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const res = await fetch("/api/creators");
      if (res.ok) {
        const data = await res.json();
        setCreators(data.creators || []);
      }
    } catch {
      console.error("Failed to fetch creators");
    }
    setLoading(false);
  };

  const filteredCreators = creators.filter(c =>
    c.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    c.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      {/* <header className="bg-white border-b border-zinc-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-4">

          </div>
        </div>
      </header> */}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Explore Creators</h1>
          <p className="text-zinc-500">Chat with AI versions of your favorite creators</p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-90 bg-white">
          <Input
            type="text"
            placeholder="Search creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Creators Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full"></div>
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-900 mb-2">No creators found</h3>
            <p className="text-zinc-500">
              {search ? "Try a different search term" : "Be the first to create an AI twin!"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <Card
                key={creator.id}
              >
                <Link
                  key={creator.id}
                  href={`/chat/${creator.username}`}
                >
                  <div
                    className="h-24 mt-[-16px]"
                    style={{ backgroundColor: creator.accentColor || "#7C3AED" }}
                  />
                  <div className="p-5">
                    <div className="flex items-center gap-4 -mt-10">
                      {creator.profilePhotoUrl ? (
                        <img
                          src={creator.profilePhotoUrl}
                          alt={creator.displayName}
                          className="w-16 h-16 rounded-[10px] object-cover border-4 border-white"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-[10px] bg-zinc-100 border-4 border-white flex items-center justify-center">
                          <span className="text-xl font-semibold text-zinc-600">
                            {creator.displayName?.[0] || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 mt-3">
                      {creator.displayName}
                    </h3>
                    <p className="text-sm text-zinc-500">@{creator.username}</p>
                    {creator.bio && (
                      <p className="text-sm text-zinc-600 mt-2 line-clamp-2">{creator.bio}</p>
                    )}
                    <div className="mt-4 flex items-center gap-2 text-sm text-[#7C3AED]">
                      <span>Chat now</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}