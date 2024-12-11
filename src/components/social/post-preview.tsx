import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SocialPlatform } from '@prisma/client'

interface PostPreviewProps {
  platform: SocialPlatform
  content: string
  hashtags: string[]
}

export function PostPreview({ platform, content, hashtags }: PostPreviewProps) {
  const renderMobilePreview = () => {
    switch (platform) {
      case SocialPlatform.TWITTER:
        return (
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <div className="font-bold">Your Name</div>
                <div className="text-gray-500">@username</div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="whitespace-pre-wrap">{content}</p>
              <p className="text-blue-500">
                {hashtags.map(tag => `#${tag}`).join(' ')}
              </p>
            </div>
          </div>
        )

      case SocialPlatform.LINKEDIN:
        return (
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div>
                <div className="font-bold">Your Name</div>
                <div className="text-gray-500">Your Title • 1st</div>
              </div>
            </div>
            <div className="space-y-3">
              <p className="whitespace-pre-wrap">{content}</p>
              <p className="text-blue-600">
                {hashtags.map(tag => `#${tag}`).join(' ')}
              </p>
            </div>
          </div>
        )

      case SocialPlatform.FACEBOOK:
        return (
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <div className="font-bold">Your Name</div>
                <div className="text-gray-500 text-sm">Just now • 🌎</div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="whitespace-pre-wrap">{content}</p>
              <p className="text-blue-600">
                {hashtags.map(tag => `#${tag}`).join(' ')}
              </p>
            </div>
          </div>
        )

      case SocialPlatform.INSTAGRAM:
        return (
          <div className="bg-white dark:bg-gray-900 rounded-lg border">
            <div className="flex items-center p-4">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="ml-3 font-bold">your_username</div>
            </div>
            <div className="aspect-square bg-gray-100" />
            <div className="p-4 space-y-2">
              <div className="flex space-x-4">
                <span>❤️</span>
                <span>💬</span>
                <span>📤</span>
              </div>
              <p>
                <span className="font-bold">your_username</span>{" "}
                {content}
              </p>
              <p className="text-blue-600">
                {hashtags.map(tag => `#${tag}`).join(' ')}
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mobile Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-sm mx-auto">
          {renderMobilePreview()}
        </div>
      </CardContent>
    </Card>
  )
}