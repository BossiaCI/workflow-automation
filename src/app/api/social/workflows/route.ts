import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const workflowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  active: z.boolean().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = workflowSchema.parse(body)

    const workflow = await db.socialWorkflow.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        active: validatedData.active ?? true,
      },
    })

    return NextResponse.json(workflow)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[WORKFLOW_CREATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const workflows = await db.socialWorkflow.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        history: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    return NextResponse.json(workflows)
  } catch (error) {
    console.error("[WORKFLOWS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}