import { getServerSession } from "next-auth"
import { authConfig } from "./config"
import { db } from "@/lib/db"

export async function getSession() {
  return await getServerSession(authConfig)
}

export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.user?.email) {
    return null
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      plan: true,
      subscription: {
        select: {
          status: true,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  return user
}

export async function hasPermission(userId: string, permission: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) return false

  const rolePermissions = {
    ADMIN: ["*"],
    MANAGER: ["forms:manage", "users:view", "analytics:view"],
    USER: ["forms:view", "forms:submit"],
  }

  const userPermissions = rolePermissions[user.role] || []
  return userPermissions.includes("*") || userPermissions.includes(permission)
}