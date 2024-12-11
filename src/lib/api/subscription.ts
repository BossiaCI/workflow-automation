import { db } from "@/lib/db"
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client"
import { checkSubscriptionRestrictions } from "./system-settings"

export const PLAN_FEATURES = {
  [SubscriptionPlan.FREE]: {
    maxForms: 3,
    maxSubmissionsPerMonth: 100,
    maxFileSize: 5, // MB
    maxStorage: 100, // MB
    maxPdfTemplates: 3,
    features: [
      "Basic form elements",
      "Basic analytics",
      "Email notifications",
      "3 PDF templates",
    ],
  },
  [SubscriptionPlan.PREMIUM]: {
    maxForms: Infinity,
    maxSubmissionsPerMonth: Infinity,
    maxFileSize: 25, // MB
    maxStorage: 1024, // MB
    maxPdfTemplates: Infinity,
    features: [
      "Advanced form elements",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "API access",
      "Webhook integrations",
      "Unlimited PDF templates",
    ],
  },
}

export async function getUserSubscription(userId: string) {
  return await db.subscription.findUnique({
    where: { userId },
    include: {
      usage: true,
    },
  })
}

export async function updateSubscriptionUsage(subscriptionId: string, updates: {
  formsCreated?: number
  submissions?: number
  storage?: number
  apiCalls?: number
}) {
  return await db.subscriptionUsage.upsert({
    where: { subscriptionId },
    create: {
      subscriptionId,
      ...updates,
    },
    update: updates,
  })
}

export async function updateSubscriptionStatus(userId: string, status: SubscriptionStatus) {
  return await db.subscription.update({
    where: { userId },
    data: { status },
  })
}

export async function cancelSubscription(userId: string) {
  return await db.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: true,
      status: SubscriptionStatus.CANCELED,
    },
  })
}

export async function reactivateSubscription(userId: string) {
  return await db.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: false,
      status: SubscriptionStatus.ACTIVE,
    },
  })
}

export async function checkSubscriptionLimits(userId: string) {
  const restrictionsActive = await checkSubscriptionRestrictions(userId)
  if (!restrictionsActive) {
    return {
      withinLimits: true,
      limits: {
        forms: { used: 0, limit: Infinity, remaining: Infinity },
        submissions: { used: 0, limit: Infinity, remaining: Infinity },
        storage: { used: 0, limit: Infinity, remaining: Infinity },
        pdfTemplates: { used: 0, limit: Infinity, remaining: Infinity },
      },
    }
  }

  const user = await db.user.findUnique({
    where: { userId },
    include: {
      subscription: {
        include: {
          usage: true,
        },
      },
    },
  })

  if (!user || !user.subscription) {
    throw new Error("No active subscription found")
  }

  const planFeatures = PLAN_FEATURES[user.plan]
  const usage = user.subscription.usage

  if (!usage) {
    return { withinLimits: true }
  }

  return {
    withinLimits: true,
    limits: {
      forms: {
        used: usage.formsCreated,
        limit: planFeatures.maxForms,
        remaining: planFeatures.maxForms === Infinity 
          ? Infinity 
          : planFeatures.maxForms - usage.formsCreated,
      },
      submissions: {
        used: usage.submissions,
        limit: planFeatures.maxSubmissionsPerMonth,
        remaining: planFeatures.maxSubmissionsPerMonth === Infinity
          ? Infinity
          : planFeatures.maxSubmissionsPerMonth - usage.submissions,
      },
      storage: {
        used: usage.storage,
        limit: planFeatures.maxStorage,
        remaining: planFeatures.maxStorage - usage.storage,
      },
      pdfTemplates: {
        used: usage.pdfTemplates,
        limit: planFeatures.maxPdfTemplates,
        remaining: planFeatures.maxPdfTemplates === Infinity
          ? Infinity
          : planFeatures.maxPdfTemplates - usage.pdfTemplates,
      },
    },
  }