import { db } from "@/lib/db"

export async function createFormSubmission(data: {
  formId: string
  userId: string
  data: any
}) {
  const submission = await db.formSubmission.create({
    data,
  })

  // Update form analytics
  await db.formAnalytics.upsert({
    where: { formId: data.formId },
    create: {
      formId: data.formId,
      submissions: 1,
    },
    update: {
      submissions: { increment: 1 },
    },
  })

  return submission
}

export async function getFormSubmissions(formId: string) {
  return await db.formSubmission.findMany({
    where: { formId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}