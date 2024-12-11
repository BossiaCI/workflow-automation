import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const workflowId = searchParams.get("workflowId")
    const limit = parseInt(searchParams.get("limit") || "10")

    const history = await db.workflowHistory.findMany({
      where: {
        workflow: {
          userId: session.user.id,
          ...(workflowId && { id: workflowId }),
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error("[WORKFLOW_HISTORY]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}