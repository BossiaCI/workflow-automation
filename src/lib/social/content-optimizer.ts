import { SocialPlatform } from "@prisma/client"

interface OptimizationResult {
  content: string
  hashtags: string[]
  suggestedTime: Date
  mediaRecommendations: {
    dimensions: { width: number; height: number }
    format: string
  }[]
}

export class ContentOptimizer {
  static optimizeForPlatform(
    content: string,
    platform: SocialPlatform,
    hashtags: string[] = []
  ): OptimizationResult {
    let optimizedContent = content
    let optimizedHashtags = [...hashtags]

    switch (platform) {
      case SocialPlatform.TWITTER:
        return this.optimizeForTwitter(optimizedContent, optimizedHashtags)
      case SocialPlatform.LINKEDIN:
        return this.optimizeForLinkedIn(optimizedContent, optimizedHashtags)
      case SocialPlatform.FACEBOOK:
        return this.optimizeForFacebook(optimizedContent, optimizedHashtags)
      case SocialPlatform.INSTAGRAM:
        return this.optimizeForInstagram(optimizedContent, optimizedHashtags)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  private static optimizeForTwitter(
    content: string,
    hashtags: string[]
  ): OptimizationResult {
    // Truncate content to fit Twitter's limit
    let optimizedContent = content.slice(0, 280 - hashtags.join(' ').length - 1)

    return {
      content: optimizedContent,
      hashtags: hashtags.slice(0, 3), // Max 3 hashtags for Twitter
      suggestedTime: this.getOptimalTime(SocialPlatform.TWITTER),
      mediaRecommendations: [
        { width: 1200, height: 675, format: 'image/jpeg' },
      ],
    }
  }

  private static optimizeForLinkedIn(
    content: string,
    hashtags: string[]
  ): OptimizationResult {
    // Format content for LinkedIn's professional audience
    let optimizedContent = content
      .split('\n')
      .map(line => line.trim())
      .join('\n\n')

    return {
      content: optimizedContent,
      hashtags: hashtags.slice(0, 3), // Max 3 hashtags for LinkedIn
      suggestedTime: this.getOptimalTime(SocialPlatform.LINKEDIN),
      mediaRecommendations: [
        { width: 1200, height: 627, format: 'image/jpeg' },
      ],
    }
  }

  private static optimizeForFacebook(
    content: string,
    hashtags: string[]
  ): OptimizationResult {
    return {
      content,
      hashtags: hashtags.slice(0, 4), // Max 4 hashtags for Facebook
      suggestedTime: this.getOptimalTime(SocialPlatform.FACEBOOK),
      mediaRecommendations: [
        { width: 1200, height: 630, format: 'image/jpeg' },
      ],
    }
  }

  private static optimizeForInstagram(
    content: string,
    hashtags: string[]
  ): OptimizationResult {
    return {
      content,
      hashtags: hashtags.slice(0, 5), // Max 5 hashtags for Instagram
      suggestedTime: this.getOptimalTime(SocialPlatform.INSTAGRAM),
      mediaRecommendations: [
        { width: 1080, height: 1080, format: 'image/jpeg' },
        { width: 1080, height: 1350, format: 'image/jpeg' },
      ],
    }
  }

  private static getOptimalTime(platform: SocialPlatform): Date {
    const now = new Date()
    
    switch (platform) {
      case SocialPlatform.TWITTER:
        now.setHours(9, 0, 0, 0) // 9 AM
        break
      case SocialPlatform.LINKEDIN:
        now.setHours(10, 0, 0, 0) // 10 AM
        break
      case SocialPlatform.FACEBOOK:
        now.setHours(13, 0, 0, 0) // 1 PM
        break
      case SocialPlatform.INSTAGRAM:
        now.setHours(11, 0, 0, 0) // 11 AM
        break
    }

    return now
  }
}