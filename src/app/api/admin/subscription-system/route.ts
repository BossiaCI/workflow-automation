import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { updateSystemSettings } from "@/lib/api/system-settings"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { active } = await req.json()

    // Update system settings
    await updateSystemSettings('subscriptionSystem', { active }, session.user.id)

    // Log the action
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: active ? "SUBSCRIPTION_SYSTEM_ACTIVATED" : "SUBSCRIPTION_SYSTEM_DEACTIVATED",
        entityType: "SYSTEM",
        entityId: "subscription-system",
        metadata: { active },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SUBSCRIPTION_SYSTEM_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const settings = await db.systemSettings.findUnique({
      where: { key: 'subscriptionSystem' },
    })

    return NextResponse.json({
      active: settings?.value?.active ?? false,
    })
  } catch (error) {
    console.error("[SUBSCRIPTION_SYSTEM_STATUS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}