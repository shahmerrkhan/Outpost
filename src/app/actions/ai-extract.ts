"use server";

import { db } from "@/../db";
import { contacts } from "@/../db/schema";
import { revalidatePath } from "next/cache";

export async function extractContacts(teamId: string, rawText: string) {
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