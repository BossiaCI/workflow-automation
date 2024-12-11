import { SocialPlatform } from "@prisma/client"
import { db } from "@/lib/db"
import { MetricsCalculator } from "./metrics-calculator"

interface ReportOptions {
  startDate: Date
  endDate: Date
  platforms: SocialPlatform[]
  metrics: string[]
  groupBy: 'day' | 'week' | 'month'
}

export class ReportGenerator {
  private metricsCalculator: MetricsCalculator

  constructor() {
    this.metricsCalculator = new MetricsCalculator()
  }

  async generateReport(userId: string, options: ReportOptions) {
    const posts = await db.socialPost.findMany({
      where: {
        account: {
          userId,
          platform: { in: options.platforms },
        },
        publishedAt: {
          gte: options.startDate,
          lte: options.endDate,
        },
      },
      include: {
        engagement: true,
        analytics: true,
        account: true,
      },
      orderBy: {
        publishedAt: 'asc',
      },
    })

    const metrics = await this.calculateMetrics(posts, options)
    const trends = this.analyzeTrends(metrics, options.groupBy)
    const topPosts = this.identifyTopPosts(posts)
    const hashtagAnalysis = await this.analyzeHashtags(posts)

    return {
      summary: {
        totalPosts: posts.length,
        totalEngagement: metrics.reduce((sum, m) => sum + m.engagement, 0),
        averageEngagement: metrics.length > 0
          ? metrics.reduce((sum, m) => sum + m.engagement, 0) / metrics.length
          : 0,
        totalImpressions: metrics.reduce((sum, m) => sum + m.impressions, 0),
      },
      metrics,
      trends,
      topPosts,
      hashtagAnalysis,
    }
  }

  private async calculateMetrics(posts: any[], options: ReportOptions) {
    const metrics = []

    for (const post of posts) {
      if (!post.engagement) continue

      const periodStart = this.getPeriodStart(
        post.publishedAt,
        options.groupBy
      )

      metrics.push({
        period: periodStart,
        platform: post.account.platform,
        posts: 1,
        impressions: post.engagement.impressions,
        engagement: post.engagement.likes + post.engagement.comments,
        clicks: post.engagement.clicks,
        shares: post.engagement.shares,
      })
    }

    return this.aggregateMetrics(metrics, options.groupBy)
  }

  private getPeriodStart(date: Date, groupBy: 'day' | 'week' | 'month'): Date {
    const result = new Date(date)
    
    switch (groupBy) {
      case 'day':
        result.setHours(0, 0, 0, 0)
        break
      case 'week':
        const day = result.getDay()
        result.setDate(result.getDate() - day)
        result.setHours(0, 0, 0, 0)
        break
      case 'month':
        result.setDate(1)
        result.setHours(0, 0, 0, 0)
        break
    }

    return result
  }

  private aggregateMetrics(metrics: any[], groupBy: string) {
    const aggregated = new Map()

    metrics.forEach(metric => {
      const key = `${metric.period.getTime()}-${metric.platform}`
      const current = aggregated.get(key) || {
        period: metric.period,
        platform: metric.platform,
        posts: 0,
        impressions: 0,
        engagement: 0,
        clicks: 0,
        shares: 0,
      }

      aggregated.set(key, {
        ...current,
        posts: current.posts + metric.posts,
        impressions: current.impressions + metric.impressions,
        engagement: current.engagement + metric.engagement,
        clicks: current.clicks + metric.clicks,
        shares: current.shares + metric.shares,
      })
    })

    return Array.from(aggregated.values())
  }

  private analyzeTrends(metrics: any[], groupBy: string) {
    const trends = {
      engagement: this.calculateTrend(metrics, 'engagement'),
      impressions: this.calculateTrend(metrics, 'impressions'),
      clicks: this.calculateTrend(metrics, 'clicks'),
    }

    return trends
  }

  private calculateTrend(metrics: any[], metric: string) {
    if (metrics.length < 2) return 0

    const values = metrics.map(m => m[metric])
    const firstValue = values[0]
    const lastValue = values[values.length - 1]

    return ((lastValue - firstValue) / firstValue) * 100
  }

  private identifyTopPosts(posts: any[]) {
    return posts
      .filter(post => post.engagement)
      .sort((a, b) => {
        const engagementA = a.engagement.likes + a.engagement.comments
        const engagementB = b.engagement.likes + b.engagement.comments
        return engagementB - engagementA
      })
      .slice(0, 5)
      .map(post => ({
        id: post.id,
        content: post.content,
        platform: post.account.platform,
        engagement: post.engagement.likes + post.engagement.comments,
        impressions: post.engagement.impressions,
        publishedAt: post.publishedAt,
      }))
  }

  private async analyzeHashtags(posts: any[]) {
    const hashtagStats = new Map()

    posts.forEach(post => {
      if (!post.hashtags || !post.engagement) return

      post.hashtags.forEach((hashtag: string) => {
        const current = hashtagStats.get(hashtag) || {
          count: 0,
          engagement: 0,
          impressions: 0,
        }

        hashtagStats.set(hashtag, {
          count: current.count + 1,
          engagement: current.engagement + post.engagement.likes + post.engagement.comments,
          impressions: current.impressions + post.engagement.impressions,
        })
      })
    })

    return Array.from(hashtagStats.entries())
      .map(([hashtag, stats]) => ({
        hashtag,
        ...stats,
        averageEngagement: stats.count > 0 
          ? stats.engagement / stats.count 
          : 0,
      }))
      .sort((a, b) => b.averageEngagement - a.averageEngagement)
  }
}