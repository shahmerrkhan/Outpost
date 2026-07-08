import { db } from "@/../db";
import { users } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ onboarded: false });

  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser.id));
  return NextResponse.json({ onboarded: dbUser?.onboarded ?? false });
}