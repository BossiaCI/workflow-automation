import sharp from 'sharp'
import { SocialPlatform } from '@prisma/client'

interface MediaDimensions {
  width: number
  height: number
}

export class MediaProcessor {
  static async optimizeImage(
    buffer: Buffer,
    platform: SocialPlatform,
    dimensions?: MediaDimensions
  ): Promise<Buffer> {
    const image = sharp(buffer)
    const metadata = await image.metadata()

    // Get optimal dimensions for the platform
    const optimalDimensions = this.getOptimalDimensions(platform, {
      width: metadata.width || 0,
      height: metadata.height || 0,
    })

    // Apply platform-specific optimizations
    let processed = image
      .resize(optimalDimensions.width, optimalDimensions.height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })

    switch (platform) {
      case SocialPlatform.INSTAGRAM:
        processed = processed.jpeg({ quality: 80, progressive: true })
        break
      case SocialPlatform.TWITTER:
        processed = processed.png({ compressionLevel: 9 })
        break
      default:
        processed = processed.jpeg({ quality: 85 })
    }

    return processed.toBuffer()
  }

  static async validateMedia(
    buffer: Buffer,
    platform: SocialPlatform
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []
    const metadata = await sharp(buffer).metadata()

    // Check file size
    const maxSize = this.getMaxFileSize(platform)
    if (buffer.length > maxSize) {
      errors.push(`File size exceeds maximum allowed for ${platform}`)
    }

    // Check dimensions
    const minDimensions = this.getMinDimensions(platform)
    if (
      (metadata.width || 0) < minDimensions.width ||
      (metadata.height || 0) < minDimensions.height
    ) {
      errors.push(`Image dimensions too small for ${platform}`)
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  private static getOptimalDimensions(
    platform: SocialPlatform,
    original: MediaDimensions
  ): MediaDimensions {
    const aspectRatio = original.width / original.height

    switch (platform) {
      case SocialPlatform.INSTAGRAM:
        return aspectRatio > 1
          ? { width: 1080, height: 608 }
          : { width: 1080, height: 1350 }
      case SocialPlatform.TWITTER:
        return { width: 1200, height: 675 }
      case SocialPlatform.LINKEDIN:
        return { width: 1200, height: 627 }
      case SocialPlatform.FACEBOOK:
        return { width: 1200, height: 630 }
      default:
        return original
    }
  }

  private static getMaxFileSize(platform: SocialPlatform): number {
    switch (platform) {
      case SocialPlatform.INSTAGRAM:
        return 8 * 1024 * 1024 // 8MB
      case SocialPlatform.TWITTER:
        return 5 * 1024 * 1024 // 5MB
      case SocialPlatform.LINKEDIN:
        return 100 * 1024 * 1024 // 100MB
      case SocialPlatform.FACEBOOK:
        return 4 * 1024 * 1024 // 4MB
      default:
        return 5 * 1024 * 1024 // 5MB default
    }
  }

  private static getMinDimensions(platform: SocialPlatform): MediaDimensions {
    switch (platform) {
      case SocialPlatform.INSTAGRAM:
        return { width: 320, height: 320 }
      case SocialPlatform.TWITTER:
        return { width: 600, height: 335 }
      case SocialPlatform.LINKEDIN:
        return { width: 552, height: 276 }
      case SocialPlatform.FACEBOOK:
        return { width: 400, height: 209 }
      default:
        return { width: 200, height: 200 }
    }
  }
}