import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { MetricsCalculator } from "@/lib/social/analytics/metrics-calculator"
import { z } from "zod"

const metricsSchema = z.object({
  platform: z.enum(["TWITTER", "LINKEDIN", "FACEBOOK", "INSTAGRAM"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const validatedData = metricsSchema.parse({
      platform: searchParams.get("platform"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    })

    const calculator = new MetricsCalculator()
    const metrics = await calculator.generateTimeBasedMetrics(
      session.user.id,
      validatedData.platform,
      new Date(validatedData.startDate),
      new Date(validatedData.endDate)
    )

    return NextResponse.json(metrics)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[METRICS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}