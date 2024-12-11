import { SocialPlatform } from "@prisma/client"
import { db } from "@/lib/db"

interface EngagementMetrics {
  impressions: number
  engagement: number
  clicks: number
  shares: number
  comments: number
  saves: number
}

export class MetricsCalculator {
  async calculateEngagement(postId: string): Promise<EngagementMetrics> {
    const post = await db.socialPost.findUnique({
      where: { id: postId },
      include: {
        engagement: true,
      },
    })

    if (!post || !post.engagement) {
      return {
        impressions: 0,
        engagement: 0,
        clicks: 0,
        shares: 0,
        comments: 0,
        saves: 0,
      }
    }

    const totalEngagements = 
      post.engagement.likes +
      post.engagement.comments +
      post.engagement.shares +
      post.engagement.clicks

    const engagementRate = 
      (totalEngagements / post.engagement.impressions) * 100

    return {
      impressions: post.engagement.impressions,
      engagement: engagementRate,
      clicks: post.engagement.clicks,
      shares: post.engagement.shares,
      comments: post.engagement.comments,
      saves: post.engagement.saves || 0,
    }
  }

  async calculateHashtagPerformance(hashtag: string, platform: SocialPlatform) {
    const posts = await db.socialPost.findMany({
      where: {
        hashtags: { has: hashtag },
        platform,
      },
      include: {
        engagement: true,
      },
    })

    const metrics = posts.reduce(
      (acc, post) => {
        if (!post.engagement) return acc

        return {
          impressions: acc.impressions + post.engagement.impressions,
          engagement: acc.engagement + post.engagement.likes + post.engagement.comments,
          reach: acc.reach + post.engagement.reach,
          posts: acc.posts + 1,
        }
      },
      { impressions: 0, engagement: 0, reach: 0, posts: 0 }
    )

    return {
      ...metrics,
      averageEngagement: metrics.posts > 0 
        ? metrics.engagement / metrics.posts 
        : 0,
      averageReach: metrics.posts > 0 
        ? metrics.reach / metrics.posts 
        : 0,
    }
  }

  async generateTimeBasedMetrics(
    userId: string,
    platform: SocialPlatform,
    startDate: Date,
    endDate: Date
  ) {
    const posts = await db.socialPost.findMany({
      where: {
        account: {
          userId,
          platform,
        },
        publishedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        engagement: true,
        analytics: true,
      },
      orderBy: {
        publishedAt: 'asc',
      },
    })

    const timeSlots = new Map()
    posts.forEach(post => {
      if (!post.publishedAt || !post.engagement) return

      const hour = post.publishedAt.getHours()
      const current = timeSlots.get(hour) || {
        posts: 0,
        engagement: 0,
        impressions: 0,
      }

      timeSlots.set(hour, {
        posts: current.posts + 1,
        engagement: current.engagement + post.engagement.likes + post.engagement.comments,
        impressions: current.impressions + post.engagement.impressions,
      })
    })

    return Array.from(timeSlots.entries()).map(([hour, metrics]) => ({
      hour,
      ...metrics,
      averageEngagement: metrics.posts > 0 
        ? metrics.engagement / metrics.posts 
        : 0,
    }))
  }
}