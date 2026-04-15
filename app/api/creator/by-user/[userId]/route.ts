import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { creators } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!db) {
      return NextResponse.json({
        displayName: "",
        username: "",
        accentColor: "#7C3AED",
        bio: "",
        speakingStyle: "",
        profilePhotoUrl: "",
        scanStatus: "idle",
      });
    }

    const creatorData = await db
      .select()
      .from(creators)
      .where(eq(creators.clerkUserId, userId))
      .limit(1);

    if (!creatorData.length) {
      return NextResponse.json({
        displayName: "",
        username: "",
        accentColor: "#7C3AED",
        bio: "",
        speakingStyle: "",
        profilePhotoUrl: "",
        scanStatus: "idle",
      });
    }

    const creator = creatorData[0];
    return NextResponse.json({
      id: creator.id,
      displayName: creator.displayName,
      username: creator.username,
      accentColor: creator.accentColor,
      bio: creator.bio,
      speakingStyle: creator.speakingStyle,
      profilePhotoUrl: creator.profilePhotoUrl,
      scanStatus: creator.scanStatus,
      credits: creator.credits,
      subscriptionPlan: creator.subscriptionPlan,
      socialUrls: creator.socialUrls,
      personaPrompt: creator.personaPrompt,
      aiTrainingPhotoUrl: creator.aiTrainingPhotoUrl,
    });
  } catch {
    return NextResponse.json({
      displayName: "",
      username: "",
      accentColor: "#7C3AED",
      bio: "",
      speakingStyle: "",
      profilePhotoUrl: "",
      scanStatus: "idle",
    });
  }
}