import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { creators } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { message: "Database not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const {
      clerkUserId,
      displayName,
      username,
      accentColor,
      bio,
      speakingStyle,
      profilePhotoUrl,
      personaPrompt,
      aiTrainingPhotoUrl,
    } = body;

    if (!clerkUserId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const existing = await db
      .select()
      .from(creators)
      .where(eq(creators.clerkUserId, clerkUserId))
      .limit(1);

    if (existing.length) {
      await db
        .update(creators)
        .set({
          ...(displayName !== undefined && displayName ? { displayName } : {}),
          ...(username !== undefined && username ? { username } : {}),
          ...(accentColor !== undefined && accentColor ? { accentColor } : {}),
          ...(bio !== undefined && { bio }),
          ...(speakingStyle !== undefined && { speakingStyle }),
          ...(profilePhotoUrl !== undefined && { profilePhotoUrl }),
          ...(personaPrompt !== undefined && { personaPrompt }),
          ...(aiTrainingPhotoUrl !== undefined && { aiTrainingPhotoUrl }),
        })
        .where(eq(creators.id, existing[0].id));

      return NextResponse.json({ success: true });
    } else {
      await db.insert(creators).values({
        clerkUserId,
        ...(displayName ? { displayName } : {}),
        ...(username ? { username } : {}),
        ...(accentColor ? { accentColor } : {}),
        ...(bio ? { bio } : {}),
        ...(speakingStyle ? { speakingStyle } : {}),
        ...(profilePhotoUrl ? { profilePhotoUrl } : {}),
        ...(personaPrompt ? { personaPrompt } : {}),
        ...(aiTrainingPhotoUrl ? { aiTrainingPhotoUrl } : {}),
      });

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Save API error:", error);
    return NextResponse.json(
      { message: "Failed to save" },
      { status: 500 }
    );
  }
}