import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { AutoResponder } from "@/lib/social/engagement/auto-responder"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string(),
  platform: z.enum(["TWITTER", "LINKEDIN", "FACEBOOK", "INSTAGRAM"]),
  postId: z.string(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = commentSchema.parse(body)

    const autoResponder = new AutoResponder()
    await autoResponder.loadRules(session.user.id)

    const response = await autoResponder.processComment({
      ...validatedData,
      userId: session.user.id,
    })

    return NextResponse.json({ response })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[AUTO_RESPOND]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}