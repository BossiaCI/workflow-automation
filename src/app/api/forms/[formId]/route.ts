import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { deleteForm } from "@/lib/api/forms"

export async function DELETE(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await deleteForm(params.formId)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[FORM_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}