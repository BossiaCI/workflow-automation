import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
})

export async function rateLimit(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1"
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

  return {
    success,
    limit,
    reset,
    remaining,
  }
}