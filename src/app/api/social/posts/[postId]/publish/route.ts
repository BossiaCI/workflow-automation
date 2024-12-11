import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { WorkflowManager } from "@/lib/social/workflow-manager"

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const workflowManager = new WorkflowManager()
    const result = await workflowManager.publishPost(params.postId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[SOCIAL_POST_PUBLISH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}