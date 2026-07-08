import { db } from "./index";
import { organizations } from "./schema";

async function seed() {
  const [org] = await db.insert(organizations).values({ name: "NGN Hacks" }).returning();
  console.log("Org created:", org.id);
}

seed();