"use server";

import { db } from "@/../db";
import { contacts, teamMembers, users } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { checkRateLimit, strictRateLimit } from "@/app/lib/ratelimit";

async function getDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Not signed in");
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser.id));
  if (!dbUser) throw new Error("User not synced");
  return dbUser;
}

async function assertTeamMember(teamId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
  if (!membership) throw new Error("Not authorized");
}

export async function extractContacts(teamId: string, rawText: string) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  await checkRateLimit(strictRateLimit, dbUser.id);

  if (!rawText || rawText.length > 20000) throw new Error("Text too long (max 20,000 characters)");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Extract every contact mentioned in this text. Return ONLY a JSON array, no other text, no markdown fences. Each item: {"name": string, "email": string or null, "company": string or null}.\n\nText:\n${rawText}`,
        },
      ],
      temperature: 0,
    }),
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "[]";
  const clean = text.replace(/```json|```/g, "").trim();

  let extracted: { name: string; email: string | null; company: string | null }[] = [];
  try {
    extracted = JSON.parse(clean);
  } catch {
    return { count: 0, error: "Could not parse extraction" };
  }

  for (const c of extracted) {
    if (!c.name) continue;
    await db.insert(contacts).values({
      teamId,
      name: c.name,
      email: c.email ?? undefined,
      company: c.company ?? undefined,
    });
  }

  revalidatePath("/crm");
  return { count: extracted.length };
}