import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const emailSettingsSchema = z.object({
  provider: z.enum(["SENDGRID", "MAILTRAP"]),
  apiKey: z.string().min(1, "API key is required"),
  fromEmail: z.string().email("Invalid email address"),
  fromName: z.string().min(1, "Sender name is required"),
  replyTo: z.string().email("Invalid reply-to email").optional(),
  testMode: z.boolean().optional(),
  trackOpens: z.boolean().optional(),
  trackClicks: z.boolean().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = emailSettingsSchema.parse(body)

    const settings = await db.emailSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...validatedData,
      },
      update: validatedData,
    })

    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[EMAIL_SETTINGS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const settings = await db.emailSettings.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("[EMAIL_SETTINGS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}