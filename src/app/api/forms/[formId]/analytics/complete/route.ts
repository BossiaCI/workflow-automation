import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { updateFormAnalytics } from "@/lib/api/form-analytics"

export async function POST(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { timeSpent } = await req.json()
    
    await updateFormAnalytics(params.formId, {
      averageTime: timeSpent,
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[FORM_COMPLETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}