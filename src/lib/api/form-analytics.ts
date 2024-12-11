import { db } from "@/lib/db"
import { startOfDay, subDays } from "date-fns"

export async function getFormAnalytics(formId: string) {
  return await db.formAnalytics.findUnique({
    where: { formId },
    include: {
      form: {
        select: {
          title: true,
          type: true,
          createdAt: true,
          fields: true,
          submissions: {
            select: {
              data: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 100
          }
        },
      },
    },
  })
}

export async function getSubmissionTrends(formId: string, days: number = 7) {
  const startDate = startOfDay(subDays(new Date(), days))
  
  const submissions = await db.formSubmission.groupBy({
    by: ['createdAt'],
    where: {
      formId,
      createdAt: {
        gte: startDate,
      },
    },
    _count: true,
  })

  return submissions
}

export async function incrementFormViews(formId: string) {
  return await db.formAnalytics.upsert({
    where: { formId },
    create: {
      formId,
      views: 1,
    },
    update: {
      views: { increment: 1 },
    },
  })
}

export async function updateFormAnalytics(formId: string, data: {
  averageTime?: number
}) {
  return await db.formAnalytics.update({
    where: { formId },
    data,
  })
}