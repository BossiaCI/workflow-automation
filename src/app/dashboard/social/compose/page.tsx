import { Metadata } from "next"
import { PostOptimizer } from "@/components/social/post-optimizer"
import { PostPreview } from "@/components/social/post-preview"
import { useState } from "react"
import { SocialPlatform } from "@prisma/client"

export const metadata: Metadata = {
  title: "Compose Post",
  description: "Create and optimize social media posts",
}

interface OptimizedPost {
  platform: SocialPlatform
  content: string
  hashtags: string[]
}

export default function ComposePage() {
  const [optimizedPost, setOptimizedPost] = useState<OptimizedPost | null>(null)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PostOptimizer onOptimize={setOptimizedPost} />
      {optimizedPost && (
        <PostPreview
          platform={optimizedPost.platform}
          content={optimizedPost.content}
          hashtags={optimizedPost.hashtags}
        />
      )}
    </div>
  )
}