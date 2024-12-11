import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  type: z.enum(["WELCOME", "FORM_SUBMISSION", "REMINDER", "CONFIRMATION", "ABANDONED_FORM", "CUSTOM"]),
  variables: z.record(z.any()).optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = templateSchema.parse(body)

    const template = await db.emailTemplate.create({
      data: validatedData,
    })

    return NextResponse.json(template)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[EMAIL_TEMPLATE_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const templates = await db.emailTemplate.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("[EMAIL_TEMPLATES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}