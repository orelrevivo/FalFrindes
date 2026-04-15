import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { creators, chatMessages } from "@/lib/schema";
import { eq, and, gte, lt, sql, desc, ne } from "drizzle-orm";

interface TopicData {
  topic: string;
  count: number;
  percentage: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
}

function extractTopicsFromMessages(messages: string[]): Map<string, number> {
  const topics = new Map<string, number>();
  
  const topicKeywords: Record<string, string[]> = {
    "Music": ["music", "song", "album", "singer", "singing", "band", "playlist", "spotify", "concert", "tour", "lyrics", "rap", "hip hop", "pop", "rock", "dj"],
    "Gaming": ["game", "gaming", "play", "stream", "twitch", "youtube", "video game", "esports", "console", "pc", "ps5", "xbox", "minecraft", "fortnite", "gamer"],
    "Tech": ["tech", "technology", "ai", "computer", "phone", "iphone", "android", "software", "code", "programming", "app", "startup", "digital"],
    "Fitness": ["fitness", "workout", "gym", "exercise", "health", "training", "body", "muscle", "run", "running", "cardio", "diet", "weight"],
    "Fashion": ["fashion", "clothes", "style", "outfit", "wear", "dress", "shopping", "brand", "trend", "makeup", "beauty", "hair"],
    "Food": ["food", "cooking", "recipe", "eat", "restaurant", "chef", "kitchen", "meal", "breakfast", "lunch", "dinner", "healthy"],
    "Travel": ["travel", "trip", "vacation", "hotel", "flight", "airplane", "destination", "world", "country", "beach", "adventure", "explore"],
    "Sports": ["sports", "football", "soccer", "basketball", "nba", "nfl", "tennis", "golf", "athlete", "team", "game", "match", "score"],
    "Movies": ["movie", "film", "cinema", "netflix", "series", "tv", "show", "actor", "actress", "hollywood", "director", "watch"],
    "Business": ["business", "money", "invest", "stock", "crypto", "entrepreneur", "startup", "career", "job", "salary", "marketing"],
    "Education": ["learn", "study", "school", "college", "university", "course", "tutorial", "book", "knowledge", "science", "math"],
    "Lifestyle": ["life", "life", "family", "relationship", "dating", "friend", "hobby", "pet", "home", "day", "routine"],
  };

  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "can", "need", "to", "of", "in", "for", "on", "with", "at", "by", "from", "as", "into", "through", "during", "before", "after", "above", "below", "between", "and", "but", "or", "because", "until", "while", "if", "then", "so", "just", "like", "about", "what", "who", "which", "when", "where", "why", "how", "all", "each", "every", "both", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "than", "too", "very", "s", "t", "just", "don", "now", "hey", "hi", "hello", "ok", "okay", "yes", "yeah", "no", "nope", "sure", "thanks", "thank", "please", "sorry", "good", "great", "nice", "cool", "awesome", "amazing", "love", "like", "want", "know", "think", "see", "got", "get", "make", "come", "take", "tell", "say", "thing", "things", "stuff", "really", "actually", "probably", "maybe", "well", "still", "also", "back", "going", "gonna", "wanna", "dont", "cant", "im", "youre", "hes", "shes", "its", "were", "theyre", "thats", "whats", "heres",
  ]);

  for (const msg of messages) {
    const lower = msg.toLowerCase();
    const words = lower.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          topics.set(topic, (topics.get(topic) || 0) + 1);
        }
      }
    }
  }

  return topics;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { creatorId } = body;

    if (!db) {
      return NextResponse.json({ stats: null });
    }

    let targetCreatorId = creatorId;
    if (!targetCreatorId) {
      const creatorData = await db
        .select()
        .from(creators)
        .where(eq(creators.clerkUserId, userId))
        .limit(1);
      
      if (creatorData.length) {
        targetCreatorId = creatorData[0].id;
      }
    }

    if (!targetCreatorId) {
      return NextResponse.json({ stats: null });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const todayMessages = await db
      .select({ count: sql<number>`count(*)` })
      .from(chatMessages)
      .where(and(
        eq(chatMessages.creatorId, targetCreatorId),
        gte(chatMessages.createdAt, today)
      ));

    const monthMessages = await db
      .select({ count: sql<number>`count(*)` })
      .from(chatMessages)
      .where(and(
        eq(chatMessages.creatorId, targetCreatorId),
        gte(chatMessages.createdAt, monthAgo)
      ));

    const sessions = await db
      .select({ sessionId: chatMessages.sessionId, createdAt: chatMessages.createdAt })
      .from(chatMessages)
      .where(eq(chatMessages.creatorId, targetCreatorId));

    const uniqueSessions = new Set(sessions.map(s => s.sessionId));
    const totalChats = uniqueSessions.size;

    const lastWeekMessages = await db
      .select({ count: sql<number>`count(*)` })
      .from(chatMessages)
      .where(and(
        eq(chatMessages.creatorId, targetCreatorId),
        gte(chatMessages.createdAt, weekAgo)
      ));

    const prevWeekMessages = await db
      .select({ count: sql<number>`count(*)` })
      .from(chatMessages)
      .where(and(
        eq(chatMessages.creatorId, targetCreatorId),
        and(
          gte(chatMessages.createdAt, twoWeeksAgo),
          lt(chatMessages.createdAt, weekAgo)
        )
      ));

    const currentWeekCount = lastWeekMessages[0]?.count || 0;
    const prevWeekCount = prevWeekMessages[0]?.count || 0;
    const weekTrend = prevWeekCount > 0 
      ? Math.round(((currentWeekCount - prevWeekCount) / prevWeekCount) * 100) 
      : 0;

    const recentActivity: { date: string; messages: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayMessages = await db
        .select({ count: sql<number>`count(*)` })
        .from(chatMessages)
        .where(and(
          eq(chatMessages.creatorId, targetCreatorId),
          gte(chatMessages.createdAt, dayStart),
          lt(chatMessages.createdAt, dayEnd)
        ));

      recentActivity.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        messages: dayMessages[0]?.count || 0
      });
    }

    const userMessages = sessions.filter(s => s.sessionId);
    const sessionMessageCounts = new Map<string, number>();
    for (const msg of userMessages) {
      if (msg.sessionId) {
        sessionMessageCounts.set(msg.sessionId, (sessionMessageCounts.get(msg.sessionId) || 0) + 1);
      }
    }
    
    const returningUsers = Array.from(sessionMessageCounts.values()).filter(count => count > 5).length;
    const newUsers = totalChats - returningUsers;
    const retentionRate = totalChats > 0 ? Math.round((returningUsers / totalChats) * 100) : 0;

    const hourActivity = new Array(24).fill(0);
    for (const session of sessions) {
      if (session.createdAt) {
        const hour = new Date(session.createdAt).getHours();
        hourActivity[hour]++;
      }
    }
    
    const peakHour = hourActivity.indexOf(Math.max(...hourActivity));
    const peakHourFormatted = `${peakHour}:00`;

    const dayActivity = new Array(7).fill(0);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (const session of sessions) {
      if (session.createdAt) {
        const day = new Date(session.createdAt).getDay();
        dayActivity[day]++;
      }
    }
    
    const mostActiveDay = dayNames[dayActivity.indexOf(Math.max(...dayActivity))];

    const userMsgs = await db
      .select({ content: chatMessages.content })
      .from(chatMessages)
      .where(and(
        eq(chatMessages.creatorId, targetCreatorId),
        eq(chatMessages.role, "user")
      ));

    const userMessageTexts = userMsgs.map(m => m.content || "").filter(Boolean);
    const topicCounts = extractTopicsFromMessages(userMessageTexts);
    
    const sortedTopics: TopicData[] = Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count, percentage: 0, trend: "stable" as const, trendPercent: 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const totalTopicMentions = sortedTopics.reduce((sum, t) => sum + t.count, 0);
    if (totalTopicMentions > 0) {
      sortedTopics.forEach(t => {
        t.percentage = Math.round((t.count / totalTopicMentions) * 100);
      });
    }

    const topSearches = sortedTopics.slice(0, 5).map(t => ({
      topic: t.topic,
      count: t.count,
      percentage: t.percentage
    }));

    const avgMessagesPerChat = totalChats > 0 
      ? Math.round((userMessageTexts.length / totalChats) * 10) / 10 
      : 0;

    const stats = {
      totalChats,
      todayMessages: todayMessages[0]?.count || 0,
      monthMessages: monthMessages[0]?.count || 0,
      weekTrend,
      recentActivity,
      returningUsers,
      newUsers,
      retentionRate,
      peakHour: peakHourFormatted,
      mostActiveDay,
      topics: sortedTopics,
      topSearches,
      avgMessagesPerChat,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ stats: null });
  }
}