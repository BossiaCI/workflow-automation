import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { MetricsCalculator } from "@/lib/social/analytics/metrics-calculator"
import { z } from "zod"

const hashtagSchema = z.object({
  hashtag: z.string(),
  platform: z.enum(["TWITTER", "LINKEDIN", "FACEBOOK", "INSTAGRAM"]),
})

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const validatedData = hashtagSchema.parse({
      hashtag: searchParams.get("hashtag"),
      platform: searchParams.get("platform"),
    })

    const calculator = new MetricsCalculator()
    const performance = await calculator.calculateHashtagPerformance(
      validatedData.hashtag,
      validatedData.platform
    )

    return NextResponse.json(performance)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[HASHTAG_PERFORMANCE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}