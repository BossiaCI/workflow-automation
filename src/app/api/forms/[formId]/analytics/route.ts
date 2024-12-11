import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getFormAnalytics } from "@/lib/api/form-analytics"

export async function GET(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const analytics = await getFormAnalytics(params.formId)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error("[FORM_ANALYTICS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}