import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { CommentModerator } from "@/lib/social/engagement/comment-moderator"
import { z } from "zod"

const moderationSchema = z.object({
  content: z.string(),
  postId: z.string(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = moderationSchema.parse(body)

    const moderator = new CommentModerator()
    await moderator.loadConfig()

    const result = await moderator.moderateComment({
      ...validatedData,
      userId: session.user.id,
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[COMMENT_MODERATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}