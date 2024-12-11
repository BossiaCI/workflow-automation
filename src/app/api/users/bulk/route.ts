import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userIds, action, data } = await req.json()

    switch (action) {
      case "UPDATE_ROLE":
        await db.user.updateMany({
          where: { id: { in: userIds } },
          data: { role: data.role },
        })
        break
      case "UPDATE_STATUS":
        await db.user.updateMany({
          where: { id: { in: userIds } },
          data: { status: data.status },
        })
        break
      case "DELETE":
        await db.user.deleteMany({
          where: { id: { in: userIds } },
        })
        break
      default:
        return new NextResponse("Invalid action", { status: 400 })
    }

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `BULK_${action}`,
        entityType: "USER",
        entityId: userIds.join(","),
        metadata: { affected: userIds.length, ...data },
      },
    })

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("[USERS_BULK]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}