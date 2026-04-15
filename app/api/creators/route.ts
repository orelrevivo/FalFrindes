import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { creators } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    let creatorsList: any[] = [];
    
    if (db) {
      try {
        creatorsList = await db
          .select({
            id: creators.id,
            username: creators.username,
            displayName: creators.displayName,
            profilePhotoUrl: creators.profilePhotoUrl,
            bio: creators.bio,
            accentColor: creators.accentColor,
          })
          .from(creators)
          .where(sql`${creators.scanStatus} = 'done'`)
          .limit(50);
      } catch (e) {
        console.error("DB error:", e);
      }
    }

    return NextResponse.json({ creators: creatorsList });
  } catch (error) {
    return NextResponse.json({ creators: [] });
  }
}