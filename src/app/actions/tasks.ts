"use server";

import { db } from "@/../db";
import { tasks, users, teamMembers } from "@/../db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { checkRateLimit, strictRateLimit } from "@/app/lib/ratelimit";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]),
  assigneeId: z.string().uuid().optional().or(z.literal("")),
});

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

export async function createTask(
  teamId: string,
  title: string,
  description: string,
  priority: "low" | "medium" | "high",
  assigneeId: string,
  dueDate: string
) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  await checkRateLimit(strictRateLimit, dbUser.id);

  const parsed = taskSchema.parse({ title, description, priority, assigneeId });

  const [task] = await db
    .insert(tasks)
    .values({
      teamId,
      authorId: dbUser.id,
      title: parsed.title,
      description: parsed.description || null,
      priority: parsed.priority,
      assigneeId: parsed.assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    })
    .returning();

  revalidatePath("/tasks");
  return task;
}

export async function updateTaskStatus(teamId: string, taskId: string, status: "open" | "in_progress" | "done") {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  await db.update(tasks).set({ status }).where(and(eq(tasks.id, taskId), eq(tasks.teamId, teamId)));
  revalidatePath("/tasks");
}

export async function getTeamTasks(teamId: string) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      assigneeId: tasks.assigneeId,
      assigneeName: users.name,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(eq(tasks.teamId, teamId));
}

export async function getTeamMembersForAssign(teamId: string) {
  const dbUser = await getDbUser();
  await assertTeamMember(teamId, dbUser.id);
  return db
    .select({ id: users.id, name: users.name })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId));
}