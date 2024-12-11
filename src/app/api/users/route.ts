import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("query")
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where = {
      ...(query && {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      }),
      ...(role && { role: role as Role }),
      ...(status && { status }),
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          subscription: true,
          activityLogs: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      total,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("[USERS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { id, ...data } = body

    const user = await db.user.update({
      where: { id },
      data,
    })

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_USER",
        entityType: "USER",
        entityId: id,
        metadata: { updates: data },
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USERS_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}