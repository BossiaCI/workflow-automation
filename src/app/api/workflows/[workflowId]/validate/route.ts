import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { validateWorkflow } from "@/lib/workflow/validation"

export async function POST(
  req: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { nodes, edges } = await req.json()
    const validation = validateWorkflow(nodes, edges)

    return NextResponse.json(validation)
  } catch (error) {
    console.error("[WORKFLOW_VALIDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}