import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const workflowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  trigger: z.enum(["FORM_SUBMISSION", "USER_REGISTRATION", "FORM_ABANDONED", "SUBSCRIPTION_CHANGED", "CUSTOM_EVENT"]),
  templateId: z.string().min(1, "Template is required"),
  conditions: z.record(z.any()).optional(),
  delay: z.number().min(0).optional(),
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

    const workflow = await db.emailWorkflow.create({
      data: validatedData,
    })

    return NextResponse.json(workflow)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[EMAIL_WORKFLOW_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const workflows = await db.emailWorkflow.findMany({
      include: {
        template: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(workflows)
  } catch (error) {
    console.error("[EMAIL_WORKFLOWS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}