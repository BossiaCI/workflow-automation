import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { WorkflowManager } from "@/lib/social/workflow-manager"
import { z } from "zod"

const scheduleSchema = z.object({
  scheduledFor: z.string().datetime(),
})

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { scheduledFor } = scheduleSchema.parse(body)

    const workflowManager = new WorkflowManager()
    const result = await workflowManager.schedulePost(
      params.postId,
      new Date(scheduledFor)
    )

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[SOCIAL_POST_SCHEDULE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}