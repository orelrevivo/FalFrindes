"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalyticsSectionProps {
  creatorData: any;
  activeSubTab?: ViewType;
  onSubTabChange?: (tab: ViewType) => void;
}

interface TopicData {
  topic: string;
  count: number;
  percentage: number;
}

type ViewType = "overview" | "topics" | "activity";

export function AnalyticsSection({ creatorData, activeSubTab: externalActiveTab, onSubTabChange: externalOnTabChange }: AnalyticsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [searchTopic, setSearchTopic] = useState("");
  const [filteredTopics, setFilteredTopics] = useState<TopicData[]>([]);
  const internalActiveView = externalActiveTab || "overview";
  const setInternalActiveView = externalOnTabChange || (() => { });

  useEffect(() => {
    if (creatorData?.id) {
      fetchStats();
    }
  }, [creatorData?.id]);

  useEffect(() => {
    if (stats?.topics) {
      if (searchTopic.trim() === "") {
        setFilteredTopics(stats.topics.slice(0, 10));
      } else {
        const filtered = stats.topics.filter((t: TopicData) =>
          t.topic.toLowerCase().includes(searchTopic.toLowerCase())
        );
        setFilteredTopics(filtered);
      }
    }
  }, [searchTopic, stats?.topics]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: creatorData.id }),
      });
      const data = await res.json();
      setStats(data.stats);
      if (data.stats?.topics) {
        setFilteredTopics(data.stats.topics.slice(0, 10));
      }
    } catch {
      console.error("Failed to fetch");
    }
    setLoading(false);
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-500";
    if (value < 0) return "text-red-500";
    return "text-zinc-400";
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return "↑";
    if (value < 0) return "↓";
    return "→";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-3 border-[#7C3AED] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs value={internalActiveView} onValueChange={(v) => externalOnTabChange ? externalOnTabChange(v as ViewType) : setInternalActiveView(v as ViewType)}>

        <TabsContent value="overview">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Total Chats</p>
                <p className="text-2xl font-bold">{stats?.totalChats || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{stats?.todayMessages || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{stats?.monthMessages || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Week Trend</p>
                <div className={`text-2xl font-bold ${getTrendColor(stats?.weekTrend || 0)}`}>
                  {getTrendIcon(stats?.weekTrend || 0)} {Math.abs(stats?.weekTrend || 0)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">New Users</p>
                <p className="text-xl font-bold">{stats?.newUsers || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Returning</p>
                <p className="text-xl font-bold">{stats?.returningUsers || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Peak Hour</p>
                <p className="text-xl font-bold">{stats?.peakHour || "N/A"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Top Day</p>
                <p className="text-xl font-bold">{stats?.mostActiveDay || "N/A"}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg messages per chat</span>
                    <span className="text-sm font-medium">{stats?.avgMessagesPerChat || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">User retention rate</span>
                    <span className="text-sm font-medium">{stats?.retentionRate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Unique topics detected</span>
                    <span className="text-sm font-medium">{stats?.topics?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Last 7 Days</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {(stats?.recentActivity || []).map((day: any, i: number) => (
                    <div key={i} className="px-4 flex items-center justify-between py-1 border-b border-zinc-300 last:border-0">
                      <span className="text-sm text-muted-foreground">{day.date}</span>
                      <span className="text-sm font-medium">{day.messages} msgs</span>
                    </div>
                  ))}
                  {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-2">No activity yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trending Topics</CardTitle>
              <CardDescription>What fans are asking about - click to see details</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Search topics..."
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                className="mb-4"
              />

              <div className="space-y-2">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic: TopicData, i: number) => (
                    <div key={i} className="flex items-center justify-between py-3 px-4 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
                        <span className="text-base font-medium">{topic.topic}</span>
                        <span className="text-xs text-muted-foreground">({topic.count} mentions)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-3 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#7C3AED] rounded-full"
                            style={{ width: `${topic.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{topic.percentage}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No topics found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Activity</CardTitle>
                <CardDescription>Messages per day over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(stats?.recentActivity || []).map((day: any, i: number) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="w-20 text-sm text-muted-foreground">{day.date}</span>
                      <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden relative">
                        {stats?.recentActivity && stats.recentActivity.length > 0 && (
                          <div
                            className="h-full bg-[#7C3AED] rounded-md"
                            style={{
                              width: `${Math.max(5, (day.messages / Math.max(...stats.recentActivity.map((d: any) => d.messages))) * 100)}%`
                            }}
                          />
                        )}
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
                          {day.messages}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">When Fans Are Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Peak Hour</span>
                      <span className="text-sm font-medium">{stats?.peakHour || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Most Active Day</span>
                      <span className="text-sm font-medium">{stats?.mostActiveDay || "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">User Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Unique Chats</span>
                      <span className="text-sm font-medium">{stats?.totalChats || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">New Users</span>
                      <span className="text-sm font-medium">{stats?.newUsers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Returning Users</span>
                      <span className="text-sm font-medium">{stats?.returningUsers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Retention Rate</span>
                      <span className="text-sm font-medium">{stats?.retentionRate || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}