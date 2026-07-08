import { pgTable, uuid, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["org_admin", "leader", "member"]);
export const memberStatusEnum = pgEnum("member_status", ["active", "removed"]);
export const requestStatusEnum = pgEnum("request_status", ["pending", "approved", "denied"]);
export const notifTypeEnum = pgEnum("notif_type", ["join_request", "approved", "denied", "announcement"]);
export const outreachTypeEnum = pgEnum("outreach_type", [
  "email", "follow_up", "call", "meeting", "sponsor_outreach",
  "partnership_outreach", "social_media", "design_work", "dev_work", "general_task"
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  orgId: uuid("org_id").references(() => organizations.id),
  role: roleEnum("role").default("member").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  school: text("school"),
  onboarded: boolean("onboarded").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  leaderId: uuid("leader_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  status: memberStatusEnum("status").default("active").notNull(),
  role: text("role").default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const joinRequests = pgTable("join_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  status: requestStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: notifTypeEnum("type").notNull(),
  payload: text("payload"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactTypeEnum = pgEnum("contact_type", ["sponsor", "speaker", "mentor", "partner", "volunteer", "organization"]);

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  company: text("company"),
  status: text("status").default("lead").notNull(),
  contactType: contactTypeEnum("contact_type").default("sponsor").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const announcements = pgTable("announcements", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id).notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  pinned: boolean("pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sharedCredentials = pgTable("shared_credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id).notNull(),
  label: text("label").notNull(),
  site: text("site").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const outreachLogs = pgTable("outreach_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  teamId: uuid("team_id").references(() => teams.id).notNull(),
  contactId: uuid("contact_id").references(() => contacts.id),
  type: outreachTypeEnum("type").notNull(),
  company: text("company"),
  contactEmail: text("contact_email"),
  notes: text("notes"),
  outcome: text("outcome"),
  timeSpentMin: text("time_spent_min"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const registrantStatusEnum = pgEnum("registrant_status", ["registered", "confirmed", "attended", "no_show", "cancelled"]);

export const registrants = pgTable("registrants", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  school: text("school"),
  grade: text("grade"),
  status: registrantStatusEnum("status").default("registered").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});