import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const workflow = await db.socialWorkflow.update({
      where: {
        id: params.workflowId,
        userId: session.user.id,
      },
      data: {
        active: true,
      },
    })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error("[WORKFLOW_ACTIVATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const workflow = await db.socialWorkflow.update({
      where: {
        id: params.workflowId,
        userId: session.user.id,
      },
      data: {
        active: false,
      },
    })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error("[WORKFLOW_DEACTIVATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}