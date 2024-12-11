import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { WorkflowExecutor } from "@/lib/social/workflow/executor"
import { db } from "@/lib/db"
import { z } from "zod"

const workflowSchema = z.object({
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  workflowId: z.string().optional(),
  variables: z.record(z.any()).optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    const body = await req.json()
    const { nodes, edges, workflowId, variables } = workflowSchema.parse(body)

    // Log execution start
    if (workflowId) {
      await db.workflowHistory.create({
        data: {
          workflowId,
          status: 'STARTED',
          metadata: { startedAt: new Date() },
        },
      })
    }

    const executor = new WorkflowExecutor(nodes, edges, session.user.id)
    const result = await executor.execute()
    
    // Log execution result
    if (workflowId) {
      await db.workflowHistory.create({
        data: {
          workflowId,
          status: result.success ? 'COMPLETED' : 'FAILED',
          error: result.error,
          metadata: {
            completedAt: new Date(),
            history: result.history,
          },
        },
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[WORKFLOW_EXECUTE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}