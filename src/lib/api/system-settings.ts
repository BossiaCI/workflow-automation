import { db } from "@/lib/db"

export async function getSystemSettings(key: string) {
  const settings = await db.systemSettings.findUnique({
    where: { key },
  })
  return settings?.value
}

export async function updateSystemSettings(key: string, value: any, userId: string) {
  return await db.systemSettings.upsert({
    where: { key },
    create: {
      key,
      value,
      updatedBy: userId,
    },
    update: {
      value,
      updatedBy: userId,
    },
  })
}

export async function isSubscriptionSystemActive() {
  const settings = await getSystemSettings('subscriptionSystem')
  return settings?.active ?? false
}

export async function checkSubscriptionRestrictions(userId: string) {
  const [systemActive, user] = await Promise.all([
    isSubscriptionSystemActive(),
    db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    }),
  ])

  // Admins are always unrestricted
  if (user?.role === 'ADMIN') return false

  return systemActive
}