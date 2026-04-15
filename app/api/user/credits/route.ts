import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { creators } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ credits: "0.20", subscriptionTier: "free" });
    }

    if (!db) {
      return NextResponse.json({ credits: "0.20", subscriptionTier: "free" });
    }

    const creatorData = await db
      .select()
      .from(creators)
      .where(eq(creators.clerkUserId, userId))
      .limit(1);

    if (!creatorData.length) {
      return NextResponse.json({ credits: "0.20", subscriptionTier: "free" });
    }

    const creator = creatorData[0];
    const currentCredits = parseFloat(creator.credits || "0.20");
    const currentTier = creator.subscriptionPlan || "free";

    return NextResponse.json({ 
      credits: creator.credits || "0.20",
      subscriptionTier: currentTier,
    });
  } catch (error) {
    console.error("Get user credits error:", error);
    return NextResponse.json({ credits: "0.20", subscriptionTier: "free" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - no user ID" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, amount, tier } = body;

    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }

    const creatorData = await db
      .select()
      .from(creators)
      .where(eq(creators.clerkUserId, userId))
      .limit(1);

    if (!creatorData.length) {
      return NextResponse.json({ error: "Creator not found - user may not have created profile yet" }, { status: 404 });
    }

    const creator = creatorData[0];
    const currentCredits = parseFloat(creator.credits || "0.20");
    const newCredits = currentCredits + amount;

    await db
      .update(creators)
      .set({
        credits: newCredits.toString(),
        subscriptionPlan: tier || creator.subscriptionPlan,
        subscriptionStatus: "active",
      })
      .where(eq(creators.clerkUserId, userId));

    return NextResponse.json({ 
      success: true, 
      credits: newCredits.toString(),
      subscriptionTier: tier || "free",
    });
  } catch (error) {
    console.error("Update user credits error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}