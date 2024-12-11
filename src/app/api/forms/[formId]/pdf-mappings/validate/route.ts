import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"

const mappingValidationSchema = z.object({
  mappings: z.array(z.object({
    fieldId: z.string(),
    x: z.number().min(0).max(1000),
    y: z.number().min(0).max(1000),
    width: z.number().min(0).max(1000).optional(),
    fontSize: z.number().min(6).max(72).optional(),
    fontFamily: z.string().optional(),
    alignment: z.enum(["left", "center", "right"]).optional(),
  })),
  pageSize: z.object({
    width: z.number(),
    height: z.number(),
  }),
})

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
    const validatedData = mappingValidationSchema.parse(body)

    // Validate that all mappings fit within page bounds
    const errors = validatedData.mappings.reduce((acc, mapping) => {
      if (mapping.x + (mapping.width || 0) > validatedData.pageSize.width) {
        acc.push(`Field ${mapping.fieldId} extends beyond page width`)
      }
      if (mapping.y > validatedData.pageSize.height) {
        acc.push(`Field ${mapping.fieldId} extends beyond page height`)
      }
      return acc
    }, [] as string[])

    return NextResponse.json({
      isValid: errors.length === 0,
      errors,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[PDF_MAPPING_VALIDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}