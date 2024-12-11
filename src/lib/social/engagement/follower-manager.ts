import { db } from "@/lib/db"
import { SocialPlatform } from "@prisma/client"

interface FollowRule {
  platform: SocialPlatform
  conditions: {
    minFollowers?: number
    maxFollowers?: number
    mustBeVerified?: boolean
    mustFollowBack?: boolean
    keywords?: string[]
    excludedKeywords?: string[]
  }
}

export class FollowerManager {
  private rules: FollowRule[] = []

  async loadRules(userId: string) {
    const settings = await db.systemSettings.findFirst({
      where: { key: 'followRules' },
    })

    this.rules = settings?.value?.rules || [
      {
        platform: SocialPlatform.TWITTER,
        conditions: {
          minFollowers: 100,
          maxFollowers: 10000,
          mustBeVerified: false,
          mustFollowBack: true,
          keywords: ['tech', 'developer', 'programming'],
          excludedKeywords: ['spam', 'bot'],
        },
      },
      {
        platform: SocialPlatform.INSTAGRAM,
        conditions: {
          minFollowers: 500,
          maxFollowers: 20000,
          mustBeVerified: false,
          keywords: ['photography', 'design', 'art'],
        },
      },
    ]
  }

  async evaluateFollow(data: {
    platform: SocialPlatform
    targetUserId: string
    targetUserData: {
      followers: number
      isVerified: boolean
      bio: string
      followsBack: boolean
    }
  }): Promise<{ shouldFollow: boolean; reason?: string }> {
    const rule = this.rules.find(r => r.platform === data.platform)
    if (!rule) return { shouldFollow: false, reason: "No rule for platform" }

    const { conditions } = rule
    const { targetUserData } = data

    // Check followers range
    if (
      conditions.minFollowers && targetUserData.followers < conditions.minFollowers ||
      conditions.maxFollowers && targetUserData.followers > conditions.maxFollowers
    ) {
      return {
        shouldFollow: false,
        reason: "Followers count outside acceptable range",
      }
    }

    // Check verification status
    if (conditions.mustBeVerified && !targetUserData.isVerified) {
      return {
        shouldFollow: false,
        reason: "User not verified",
      }
    }

    // Check follow back status
    if (conditions.mustFollowBack && !targetUserData.followsBack) {
      return {
        shouldFollow: false,
        reason: "User doesn't follow back",
      }
    }

    // Check keywords
    if (conditions.keywords?.length) {
      const bioWords = targetUserData.bio.toLowerCase().split(/\s+/)
      const hasKeyword = conditions.keywords.some(keyword =>
        bioWords.includes(keyword.toLowerCase())
      )
      if (!hasKeyword) {
        return {
          shouldFollow: false,
          reason: "No matching keywords found",
        }
      }
    }

    // Check excluded keywords
    if (conditions.excludedKeywords?.length) {
      const bioWords = targetUserData.bio.toLowerCase().split(/\s+/)
      const hasExcludedKeyword = conditions.excludedKeywords.some(keyword =>
        bioWords.includes(keyword.toLowerCase())
      )
      if (hasExcludedKeyword) {
        return {
          shouldFollow: false,
          reason: "Contains excluded keywords",
        }
      }
    }

    return { shouldFollow: true }
  }

  async evaluateUnfollow(data: {
    platform: SocialPlatform
    targetUserId: string
    followDuration: number
    hasInteracted: boolean
    followsBack: boolean
  }): Promise<{ shouldUnfollow: boolean; reason?: string }> {
    // Unfollow if user hasn't interacted and doesn't follow back after 30 days
    if (
      data.followDuration > 30 * 24 * 60 * 60 * 1000 && // 30 days
      !data.hasInteracted &&
      !data.followsBack
    ) {
      return {
        shouldUnfollow: true,
        reason: "No interaction and doesn't follow back",
      }
    }

    return { shouldUnfollow: false }
  }

  async logFollowAction(data: {
    userId: string
    targetUserId: string
    platform: SocialPlatform
    action: "FOLLOW" | "UNFOLLOW"
    reason: string
  }) {
    await db.activityLog.create({
      data: {
        userId: data.userId,
        action: `AUTO_${data.action}`,
        entityType: "USER",
        entityId: data.targetUserId,
        metadata: {
          platform: data.platform,
          reason: data.reason,
        },
      },
    })
  }
}