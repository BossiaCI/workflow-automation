import { db } from "@/lib/db"

interface ModeratorConfig {
  profanityList: string[]
  spamPatterns: RegExp[]
  maxLinks: number
  minLength: number
}

export class CommentModerator {
  private config: ModeratorConfig = {
    profanityList: [],
    spamPatterns: [
      /\b(buy|cheap|discount|sale|offer)\b/i,
      /https?:\/\/[^\s]+/g,
    ],
    maxLinks: 2,
    minLength: 2,
  }

  async loadConfig() {
    const settings = await db.systemSettings.findFirst({
      where: { key: 'commentModeration' },
    })

    if (settings?.value) {
      this.config = {
        ...this.config,
        ...settings.value,
      }
    }
  }

  async moderateComment(comment: {
    content: string
    userId: string
    postId: string
  }): Promise<{ approved: boolean; reason?: string }> {
    // Check minimum length
    if (comment.content.trim().length < this.config.minLength) {
      return {
        approved: false,
        reason: "Comment too short",
      }
    }

    // Check for profanity
    const hasProfanity = this.config.profanityList.some(word =>
      comment.content.toLowerCase().includes(word.toLowerCase())
    )
    if (hasProfanity) {
      return {
        approved: false,
        reason: "Contains inappropriate content",
      }
    }

    // Check for spam patterns
    const isSpam = this.config.spamPatterns.some(pattern =>
      pattern.test(comment.content)
    )
    if (isSpam) {
      return {
        approved: false,
        reason: "Detected as spam",
      }
    }

    // Check link count
    const linkCount = (comment.content.match(/https?:\/\/[^\s]+/g) || []).length
    if (linkCount > this.config.maxLinks) {
      return {
        approved: false,
        reason: "Too many links",
      }
    }

    await this.logModeration({
      userId: comment.userId,
      postId: comment.postId,
      approved: true,
    })

    return { approved: true }
  }

  private async logModeration(data: {
    userId: string
    postId: string
    approved: boolean
    reason?: string
  }) {
    await db.activityLog.create({
      data: {
        userId: data.userId,
        action: "COMMENT_MODERATION",
        entityType: "POST",
        entityId: data.postId,
        metadata: {
          approved: data.approved,
          reason: data.reason,
        },
      },
    })
  }
}