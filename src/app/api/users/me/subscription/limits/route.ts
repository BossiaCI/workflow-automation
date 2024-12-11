import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { checkSubscriptionLimits } from "@/lib/api/subscription"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const limits = await checkSubscriptionLimits(session.user.id)
    return NextResponse.json(limits)
  } catch (error) {
    console.error("[SUBSCRIPTION_LIMITS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}