import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { SocialPlatform } from '@prisma/client'

interface PreviewPost {
  platform: SocialPlatform
  content: string
  scheduledFor?: Date
}

interface WorkflowPreviewProps {
  posts: PreviewPost[]
}

export function WorkflowPreview({ posts }: WorkflowPreviewProps) {
  const [showPreview, setShowPreview] = useState(true)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Workflow Preview</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Preview
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showPreview && (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{post.platform}</span>
                  {post.scheduledFor && (
                    <span className="text-sm text-muted-foreground">
                      Scheduled for: {post.scheduledFor.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}