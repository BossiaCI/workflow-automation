import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client"
import { updateSubscriptionStatus, cancelSubscription, reactivateSubscription } from "@/lib/api/subscription"

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { action, plan } = body

    switch (action) {
      case "UPDATE_PLAN":
        await db.user.update({
          where: { id: params.userId },
          data: { plan },
        })
        break
      case "CANCEL":
        await cancelSubscription(params.userId)
        break
      case "REACTIVATE":
        await reactivateSubscription(params.userId)
        break
      case "UPDATE_STATUS":
        await updateSubscriptionStatus(params.userId, body.status)
        break
      default:
        return new NextResponse("Invalid action", { status: 400 })
    }

    // Log the action
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `SUBSCRIPTION_${action}`,
        entityType: "SUBSCRIPTION",
        entityId: params.userId,
        metadata: { ...body },
      },
    })

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("[SUBSCRIPTION_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}