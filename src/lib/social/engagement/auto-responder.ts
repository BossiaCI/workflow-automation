import { SocialPlatform } from "@prisma/client"
import { db } from "@/lib/db"

interface ResponseRule {
  trigger: string
  response: string
  platform: SocialPlatform
  priority: number
}

export class AutoResponder {
  private rules: ResponseRule[] = []

  async loadRules(userId: string) {
    // Load custom response rules from database
    const settings = await db.systemSettings.findFirst({
      where: { key: 'autoResponder' },
    })

    this.rules = settings?.value?.rules || [
      {
        trigger: 'thank you',
        response: "You're welcome! Let us know if you need anything else.",
        platform: SocialPlatform.TWITTER,
        priority: 1,
      },
      {
        trigger: 'help',
        response: "Hi! I'll be happy to help. Please provide more details about your issue.",
        platform: SocialPlatform.FACEBOOK,
        priority: 1,
      },
      {
        trigger: 'price',
        response: "Please visit our website for current pricing information.",
        platform: SocialPlatform.LINKEDIN,
        priority: 2,
      },
    ]
  }

  async processComment(comment: {
    content: string
    platform: SocialPlatform
    userId: string
    postId: string
  }): Promise<string | null> {
    // Find matching rule with highest priority
    const matchingRule = this.rules
      .filter(rule => 
        rule.platform === comment.platform &&
        comment.content.toLowerCase().includes(rule.trigger.toLowerCase())
      )
      .sort((a, b) => b.priority - a.priority)[0]

    if (matchingRule) {
      await this.logResponse({
        userId: comment.userId,
        postId: comment.postId,
        trigger: matchingRule.trigger,
        response: matchingRule.response,
      })

      return matchingRule.response
    }

    return null
  }

  private async logResponse(data: {
    userId: string
    postId: string
    trigger: string
    response: string
  }) {
    await db.activityLog.create({
      data: {
        userId: data.userId,
        action: "AUTO_RESPONSE",
        entityType: "POST",
        entityId: data.postId,
        metadata: {
          trigger: data.trigger,
          response: data.response,
        },
      },
    })
  }
}