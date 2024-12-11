import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createFormSubmission } from "@/lib/api/form-submissions"

export async function POST(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    
    const submission = await createFormSubmission({
      formId: params.formId,
      userId: session.user.id,
      data: body,
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error("[FORM_SUBMIT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}