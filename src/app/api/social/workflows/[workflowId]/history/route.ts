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

    const history = await db.workflowHistory.findMany({
      where: {
        workflowId: params.workflowId,
        workflow: {
          userId: session.user.id,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error("[WORKFLOW_HISTORY]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}