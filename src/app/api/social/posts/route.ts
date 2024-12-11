import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { WorkflowManager } from "@/lib/social/workflow-manager"
import { z } from "zod"

const postSchema = z.object({
  content: z.string().min(1),
  hashtags: z.array(z.string()),
  platforms: z.array(z.enum(["TWITTER", "LINKEDIN", "FACEBOOK", "INSTAGRAM"])),
  scheduledFor: z.string().datetime().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = postSchema.parse(body)

    const workflowManager = new WorkflowManager()
    const posts = await workflowManager.createPost({
      userId: session.user.id,
      ...validatedData,
      scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : undefined,
    })

    return NextResponse.json(posts)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[SOCIAL_POST_CREATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const platform = searchParams.get("platform")
    const status = searchParams.get("status")

    const posts = await db.socialPost.findMany({
      where: {
        account: {
          userId: session.user.id,
          ...(platform && { platform }),
        },
        ...(status && { status }),
      },
      include: {
        account: true,
        engagement: true,
        analytics: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("[SOCIAL_POSTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}