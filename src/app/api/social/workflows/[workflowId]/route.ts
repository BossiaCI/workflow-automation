import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const workflowSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  active: z.boolean().optional(),
})

export async function GET(
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
      include: {
        history: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!workflow) {
      return new NextResponse("Workflow not found", { status: 404 })
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error("[WORKFLOW_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = workflowSchema.parse(body)

    const workflow = await db.socialWorkflow.update({
      where: { id: params.workflowId },
      data: validatedData,
    })

    return NextResponse.json(workflow)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[WORKFLOW_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await db.socialWorkflow.delete({
      where: { id: params.workflowId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[WORKFLOW_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}