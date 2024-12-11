import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generatePdfWithMappings } from "@/lib/pdf/generator"

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
    const { templateId, data } = body

    const template = await db.pdfTemplate.findFirst({
      where: {
        id: templateId,
        formId: params.formId,
      },
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    const pdfBuffer = await generatePdfWithMappings(
      template.elements,
      template.settings?.fieldMappings || [],
      data
    )

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="preview.pdf"',
      },
    })
  } catch (error) {
    console.error("[PDF_PREVIEW]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}