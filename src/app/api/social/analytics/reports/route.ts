import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ReportGenerator } from "@/lib/social/analytics/report-generator"
import { z } from "zod"

const reportSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  platforms: z.array(z.enum(["TWITTER", "LINKEDIN", "FACEBOOK", "INSTAGRAM"])),
  metrics: z.array(z.string()),
  groupBy: z.enum(["day", "week", "month"]),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = reportSchema.parse(body)

    const generator = new ReportGenerator()
    const report = await generator.generateReport(session.user.id, {
      ...validatedData,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
    })

    return NextResponse.json(report)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[REPORT_GENERATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}