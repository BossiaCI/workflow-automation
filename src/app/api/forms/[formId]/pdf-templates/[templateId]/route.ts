import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { formId: string; templateId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const template = await db.pdfTemplate.findUnique({
      where: {
        id: params.templateId,
        formId: params.formId,
      },
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("[PDF_TEMPLATE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { formId: string; templateId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await db.pdfTemplate.delete({
      where: {
        id: params.templateId,
        formId: params.formId,
      },
    })

    // Update subscription usage
    await db.subscriptionUsage.update({
      where: { subscriptionId: session.user.subscription.id },
      data: {
        pdfTemplates: { decrement: 1 },
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[PDF_TEMPLATE_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { formId: string; templateId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, description, elements, settings } = body

    const template = await db.pdfTemplate.update({
      where: {
        id: params.templateId,
        formId: params.formId,
      },
      data: {
        name,
        description,
        elements,
        settings,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("[PDF_TEMPLATE_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}