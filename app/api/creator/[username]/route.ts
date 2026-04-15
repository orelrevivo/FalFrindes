import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { creators } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!db) {
      return NextResponse.json(
        { message: "Database not configured" },
        { status: 500 }
      );
    }

    const creatorData = await db
      .select()
      .from(creators)
      .where(eq(creators.username, username))
      .limit(1);

    if (!creatorData.length) {
      return NextResponse.json(
        { message: "Creator not found" },
        { status: 404 }
      );
    }

    const creator = creatorData[0];
    return NextResponse.json({
      id: creator.id,
      displayName: creator.displayName,
      profilePhotoUrl: creator.profilePhotoUrl,
      accentColor: creator.accentColor,
      bio: creator.bio,
      personaPrompt: creator.personaPrompt,
      aiTrainingPhotoUrl: creator.aiTrainingPhotoUrl,
      scanStatus: creator.scanStatus,
    });
  } catch (error) {
    console.error("Creator API error:", error);
    return NextResponse.json(
      { message: "Error loading creator" },
      { status: 500 }
    );
  }
}