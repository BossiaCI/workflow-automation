import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const privacySchema = z.object({
  profileVisibility: z.enum(['PUBLIC', 'CONNECTIONS', 'PRIVATE']),
  messagePrivacy: z.enum(['EVERYONE', 'CONNECTIONS', 'NONE']),
  connectionRequests: z.enum(['EVERYONE', 'MUTUAL_CONNECTIONS', 'VERIFIED_ONLY', 'NONE']),
  dataSharing: z.object({
    shareProfile: z.boolean(),
    shareActivity: z.boolean(),
    shareConnections: z.boolean(),
    shareInterests: z.boolean(),
    shareAnalytics: z.boolean(),
  }),
  thirdPartyAccess: z.object({
    allowApps: z.boolean(),
    allowAnalytics: z.boolean(),
    allowMarketing: z.boolean(),
    allowIntegrations: z.boolean(),
  }),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = privacySchema.parse(body)

    // Update privacy settings for all connected social accounts
    const accounts = await db.socialAccount.findMany({
      where: {
        userId: session.user.id,
        connected: true,
      },
    })

    for (const account of accounts) {
      await db.socialPrivacySettings.upsert({
        where: { accountId: account.id },
        create: {
          accountId: account.id,
          ...validatedData,
        },
        update: validatedData,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[PRIVACY_SETTINGS_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const settings = await db.socialPrivacySettings.findFirst({
      where: {
        account: {
          userId: session.user.id,
          connected: true,
        },
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("[PRIVACY_SETTINGS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}