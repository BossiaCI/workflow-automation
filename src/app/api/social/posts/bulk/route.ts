import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { WorkflowManager } from "@/lib/social/workflow-manager"
import { z } from "zod"

const bulkScheduleSchema = z.object({
  posts: z.array(z.object({
    content: z.string(),
    hashtags: z.array(z.string()),
    platforms: z.array(z.enum(["TWITTER", "LINKEDIN", "FACEBOOK", "INSTAGRAM"])),
    scheduledFor: z.string().datetime(),
  })),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = bulkScheduleSchema.parse(body)

    const workflowManager = new WorkflowManager()
    const results = await Promise.all(
      validatedData.posts.map(post =>
        workflowManager.createPost({
          userId: session.user.id,
          ...post,
          scheduledFor: new Date(post.scheduledFor),
        })
      )
    )

    return NextResponse.json(results.flat())
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[SOCIAL_POSTS_BULK_CREATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}