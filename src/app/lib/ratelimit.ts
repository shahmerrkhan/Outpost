import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const strictRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "rl:strict",
});

export const standardRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  prefix: "rl:standard",
});

export async function checkRateLimit(limiter: Ratelimit, identifier: string) {
  const { success } = await limiter.limit(identifier);
  if (!success) throw new Error("Too many requests. Slow down.");
}