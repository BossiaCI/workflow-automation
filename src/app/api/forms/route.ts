import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createForm, updateForm } from "@/lib/api/forms"
import { FormType, SubscriptionPlan } from "@prisma/client"
import { db } from "@/lib/db"

const PLAN_LIMITS = {
  [SubscriptionPlan.FREE]: 3,
  [SubscriptionPlan.PREMIUM]: Infinity,
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, description, type, fields } = body

    if (!title || !type || !fields) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check user's form count against plan limit
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { 
        plan: true,
        forms: { select: { id: true } }
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const formCount = user.forms.length
    const formLimit = PLAN_LIMITS[user.plan]
    if (formCount >= formLimit) {
      return new NextResponse("Form limit reached for your plan", { status: 403 })
    }

    const form = await createForm({
      title,
      description,
      type: type as FormType,
      fields,
      userId: session.user.id,
    })

    return NextResponse.json(form)
  } catch (error) {
    console.error("[FORMS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { id, ...data } = body

    if (!id) {
      return new NextResponse("Form ID required", { status: 400 })
    }

    const form = await updateForm(id, data)
    return NextResponse.json(form)
  } catch (error) {
    console.error("[FORMS_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}