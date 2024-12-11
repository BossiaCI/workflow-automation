import { SocialPlatform } from "@prisma/client"

export interface SocialMediaPost {
  content: string
  hashtags: string[]
  mediaUrls?: string[]
  scheduledFor?: Date
}

export interface PlatformConfig {
  maxCharacters: number
  maxHashtags: number
  maxMedia: number
  supportedMediaTypes: string[]
  imageDimensions: {
    width: number
    height: number
  }[]
}

export abstract class SocialPlatformBase {
  protected platform: SocialPlatform
  protected config: PlatformConfig

  constructor(platform: SocialPlatform) {
    this.platform = platform
  }

  abstract post(content: SocialMediaPost): Promise<string>
  abstract schedule(content: SocialMediaPost, date: Date): Promise<string>
  abstract delete(postId: string): Promise<boolean>
  abstract getAnalytics(postId: string): Promise<any>

  validateContent(content: SocialMediaPost): string[] {
    const errors: string[] = []

    if (content.content.length > this.config.maxCharacters) {
      errors.push(`Content exceeds maximum length of ${this.config.maxCharacters} characters`)
    }

    if (content.hashtags.length > this.config.maxHashtags) {
      errors.push(`Too many hashtags. Maximum allowed is ${this.config.maxHashtags}`)
    }

    if (content.mediaUrls && content.mediaUrls.length > this.config.maxMedia) {
      errors.push(`Too many media items. Maximum allowed is ${this.config.maxMedia}`)
    }

    return errors
  }

  getOptimalPostingTime(): Date {
    // Default implementation - can be overridden by platform-specific logic
    const now = new Date()
    now.setHours(now.getHours() + 1)
    return now
  }

  formatHashtags(hashtags: string[]): string {
    return hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
  }
}