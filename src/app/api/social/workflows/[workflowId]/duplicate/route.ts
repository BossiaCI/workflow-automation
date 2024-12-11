import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const workflow = await db.socialWorkflow.findUnique({
      where: { id: params.workflowId },
    })

    if (!workflow) {
      return new NextResponse("Workflow not found", { status: 404 })
    }

    const duplicatedWorkflow = await db.socialWorkflow.create({
      data: {
        name: `${workflow.name} (Copy)`,
        description: workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
        userId: session.user.id,
        active: false,
      },
    })

    return NextResponse.json(duplicatedWorkflow)
  } catch (error) {
    console.error("[WORKFLOW_DUPLICATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}