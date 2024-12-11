import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { workflowTemplates } from "@/lib/workflow/templates"
import { z } from "zod"

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Combine built-in templates with user-saved templates
    const userTemplates = await db.emailWorkflow.findMany({
      where: {
        isTemplate: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        nodes: true,
        edges: true,
      },
    })

    const templates = {
      ...workflowTemplates,
      ...userTemplates.reduce((acc, template) => ({
        ...acc,
        [template.id]: template,
      }), {}),
    }

    return NextResponse.json(templates)
  } catch (error) {
    console.error("[WORKFLOW_TEMPLATES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = templateSchema.parse(body)

    const template = await db.emailWorkflow.create({
      data: {
        ...validatedData,
        isTemplate: true,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[WORKFLOW_TEMPLATE_CREATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}