import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const logs = await db.activityLog.findMany({
      where: {
        entityType: "WORKFLOW",
        entityId: params.workflowId,
        action: "WORKFLOW_EXECUTED",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error("[WORKFLOW_HISTORY]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}