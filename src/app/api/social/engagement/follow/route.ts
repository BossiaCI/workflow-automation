import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { FollowerManager } from "@/lib/social/engagement/follower-manager"
import { z } from "zod"

const followSchema = z.object({
  platform: z.enum(["TWITTER", "LINKEDIN", "FACEBOOK", "INSTAGRAM"]),
  targetUserId: z.string(),
  targetUserData: z.object({
    followers: z.number(),
    isVerified: z.boolean(),
    bio: z.string(),
    followsBack: z.boolean(),
  }),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = followSchema.parse(body)

    const followerManager = new FollowerManager()
    await followerManager.loadRules(session.user.id)

    const result = await followerManager.evaluateFollow(validatedData)

    if (result.shouldFollow) {
      await followerManager.logFollowAction({
        userId: session.user.id,
        targetUserId: validatedData.targetUserId,
        platform: validatedData.platform,
        action: "FOLLOW",
        reason: "Meets follow criteria",
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[FOLLOW_EVALUATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}