import { db } from "@/lib/db"
import { FormType, SubscriptionPlan } from "@prisma/client"
import { checkSubscriptionRestrictions } from "./system-settings"

const PLAN_LIMITS = {
  [SubscriptionPlan.FREE]: 3,
  [SubscriptionPlan.PREMIUM]: Infinity,
}

export async function createForm(data: {
  title: string
  description?: string
  type: FormType
  fields: any
  userId: string
}) {
  // Check user's form count against plan limit
  const restrictionsActive = await checkSubscriptionRestrictions(data.userId)
  
  if (!restrictionsActive) {
    return await db.form.create({
      data: {
        ...data,
        published: false,
      },
    })
  }

  const user = await db.user.findUnique({
    where: { id: data.userId },
    select: { plan: true, forms: { select: { id: true } } },
  })

  if (!user) throw new Error("User not found")

  const formCount = user.forms.length
  const formLimit = PLAN_LIMITS[user.plan]

  if (formCount >= formLimit) {
    throw new Error("Form limit reached for your plan")
  }

  return await db.form.create({
    data: {
      ...data,
      published: false,
    },
  })
}

export async function updateForm(id: string, data: {
  title?: string
  description?: string
  fields?: any
  published?: boolean
}) {
  return await db.form.update({
    where: { id },
    data,
  })
}

export async function getFormById(id: string) {
  return await db.form.findUnique({
    where: { id },
  })
}

export async function deleteForm(id: string) {
  return await db.form.delete({
    where: { id },
  })
}

export async function duplicateForm(id: string, userId: string) {
  const form = await db.form.findUnique({
    where: { id },
  })

  if (!form) {
    throw new Error("Form not found")
  }

  return await db.form.create({
    data: {
      title: `${form.title} (Copy)`,
      description: form.description,
      type: form.type,
      fields: form.fields,
      userId,
      published: false,
    },
  })
}