import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const mappingSchema = z.object({
  templateId: z.string(),
  mappings: z.array(z.object({
    fieldId: z.string(),
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    fontSize: z.number().optional(),
    fontFamily: z.string().optional(),
    alignment: z.enum(["left", "center", "right"]).optional(),
  })),
})

export async function POST(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = mappingSchema.parse(body)

    // Check if template exists and belongs to form
    const template = await db.pdfTemplate.findFirst({
      where: {
        id: validatedData.templateId,
        formId: params.formId,
      },
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    // Update template with field mappings
    const updatedTemplate = await db.pdfTemplate.update({
      where: { id: template.id },
      data: {
        settings: {
          ...template.settings,
          fieldMappings: validatedData.mappings,
        },
      },
    })

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[PDF_MAPPING_CREATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const templates = await db.pdfTemplate.findMany({
      where: { formId: params.formId },
      select: {
        id: true,
        name: true,
        settings: true,
      },
    })

    return NextResponse.json(templates.map(template => ({
      id: template.id,
      name: template.name,
      mappings: template.settings?.fieldMappings || [],
    })))
  } catch (error) {
    console.error("[PDF_MAPPINGS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}