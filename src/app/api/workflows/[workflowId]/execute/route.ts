import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { WorkflowExecutor } from "@/lib/workflow/executor"

export async function POST(
  req: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const workflow = await db.emailWorkflow.findUnique({
      where: { id: params.workflowId },
      include: {
        template: true,
      },
    })

    if (!workflow) {
      return new NextResponse("Workflow not found", { status: 404 })
    }

    const body = await req.json()
    const executor = new WorkflowExecutor(workflow.nodes, workflow.edges, {
      ...body,
      userId: session.user.id,
      workflowId: workflow.id,
    })

    const result = await executor.execute()

    // Log workflow execution
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "WORKFLOW_EXECUTED",
        entityType: "WORKFLOW",
        entityId: workflow.id,
        metadata: {
          status: result.status,
          history: result.history,
          error: result.error,
        },
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[WORKFLOW_EXECUTE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}