import { db } from "@/../db";
import { users } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import EmailLoggerClient from "@/app/components/EmailLoggerClient";

export default async function EmailLoggerPage() {
  const clerkUser = await currentUser();
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkUser!.id));
  if (!dbUser?.onboarded) redirect("/onboarding");

  return <EmailLoggerClient />;
}