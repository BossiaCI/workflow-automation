import { SocialPlatform, PostStatus } from "@prisma/client"
import { db } from "@/lib/db"
import { ContentOptimizer } from "./content-optimizer"
import { TwitterPlatform } from "./platforms/twitter"
import { LinkedInPlatform } from "./platforms/linkedin"

export class WorkflowManager {
  private platforms: Map<SocialPlatform, any> = new Map()

  constructor() {
    this.platforms.set(SocialPlatform.TWITTER, new TwitterPlatform())
    this.platforms.set(SocialPlatform.LINKEDIN, new LinkedInPlatform())
  }

  async createPost(data: {
    userId: string
    content: string
    hashtags: string[]
    platforms: SocialPlatform[]
    scheduledFor?: Date
    mediaUrls?: string[]
  }) {
    const posts = []

    for (const platform of data.platforms) {
      const optimized = ContentOptimizer.optimizeForPlatform(
        data.content,
        platform,
        data.hashtags
      )

      const accounts = await db.socialAccount.findMany({
        where: {
          userId: data.userId,
          platform,
          connected: true,
        },
      })

      for (const account of accounts) {
        const post = await db.socialPost.create({
          data: {
            accountId: account.id,
            content: optimized.content,
            hashtags: optimized.hashtags,
            mediaUrls: data.mediaUrls || [],
            scheduledFor: data.scheduledFor || optimized.suggestedTime,
            platform,
            status: data.scheduledFor ? PostStatus.SCHEDULED : PostStatus.DRAFT,
          },
        })

        posts.push(post)
      }
    }

    return posts
  }

  async publishPost(postId: string) {
    const post = await db.socialPost.findUnique({
      where: { id: postId },
      include: { account: true },
    })

    if (!post) throw new Error("Post not found")

    const platform = this.platforms.get(post.platform)
    if (!platform) throw new Error(`Platform ${post.platform} not supported`)

    try {
      const platformPostId = await platform.post({
        content: post.content,
        hashtags: post.hashtags,
        mediaUrls: post.mediaUrls,
      })

      await db.socialPost.update({
        where: { id: postId },
        data: {
          status: PostStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      })

      return platformPostId
    } catch (error) {
      await db.socialPost.update({
        where: { id: postId },
        data: {
          status: PostStatus.FAILED,
        },
      })
      throw error
    }
  }

  async schedulePost(postId: string, date: Date) {
    const post = await db.socialPost.update({
      where: { id: postId },
      data: {
        scheduledFor: date,
        status: PostStatus.SCHEDULED,
      },
    })

    return post
  }

  async updateAnalytics(postId: string) {
    const post = await db.socialPost.findUnique({
      where: { id: postId },
      include: { account: true },
    })

    if (!post) throw new Error("Post not found")

    const platform = this.platforms.get(post.platform)
    if (!platform) throw new Error(`Platform ${post.platform} not supported`)

    const analytics = await platform.getAnalytics(postId)

    await db.postAnalytics.upsert({
      where: { postId },
      create: {
        postId,
        ...analytics,
      },
      update: analytics,
    })

    return analytics
  }
}