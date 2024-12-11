import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { duplicateForm } from "@/lib/api/forms"

export async function POST(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const duplicatedForm = await duplicateForm(params.formId, session.user.id)
    return NextResponse.json(duplicatedForm)
  } catch (error) {
    console.error("[FORM_DUPLICATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}