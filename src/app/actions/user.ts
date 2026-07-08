"use server";

import { db } from "@/../db";
import { users, organizations } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function ensureDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Not signed in");

  let [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser.id));

  if (!dbUser) {
    let [org] = await db.select().from(organizations).limit(1);

    if (!org) {
      [org] = await db.insert(organizations).values({ name: "NGN Hacks" }).returning();
    }

    await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        orgId: org.id,
        name: clerkUser.firstName + " " + (clerkUser.lastName ?? ""),
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      })
      .onConflictDoNothing({ target: users.clerkId });

    [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser.id));
  }

  return dbUser;
}