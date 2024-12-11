import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { checkSubscriptionLimits } from "@/lib/api/subscription"

export async function POST(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check PDF template limits
    const limits = await checkSubscriptionLimits(session.user.id)
    if (limits.limits.pdfTemplates.remaining <= 0) {
      return new NextResponse("PDF template limit reached", { status: 403 })
    }

    const body = await req.json()
    const { name, description, elements, settings } = body

    const template = await db.pdfTemplate.create({
      data: {
        formId: params.formId,
        name,
        description,
        elements,
        settings,
      },
    })

    // Update subscription usage
    await db.subscriptionUsage.update({
      where: { subscriptionId: session.user.subscription.id },
      data: {
        pdfTemplates: { increment: 1 },
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("[PDF_TEMPLATE_CREATE]", error)
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
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("[PDF_TEMPLATES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}