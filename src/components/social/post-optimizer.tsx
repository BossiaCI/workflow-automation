import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SocialPlatform } from '@prisma/client'
import { ContentOptimizer } from '@/lib/social/content-optimizer'

const PLATFORM_SPECS = {
  [SocialPlatform.TWITTER]: {
    maxLength: 280,
    hashtagLimit: 3,
    imageDimensions: [
      { width: 1200, height: 675, label: 'Landscape' },
      { width: 1080, height: 1080, label: 'Square' },
    ],
    features: ['Polls', 'Threads', 'Quote Tweets'],
    bestTimes: ['Mon-Fri 8am-4pm', 'Peak: Wed 9am-3pm'],
    tone: 'Concise and conversational',
  },
  [SocialPlatform.LINKEDIN]: {
    maxLength: 3000,
    hashtagLimit: 3,
    imageDimensions: [
      { width: 1200, height: 627, label: 'Link share' },
      { width: 1200, height: 1200, label: 'Square post' },
    ],
    features: ['Articles', 'Documents', 'Polls'],
    bestTimes: ['Tue-Thu 9am-12pm', 'Peak: Wed 8am-10am'],
    tone: 'Professional and industry-focused',
  },
  [SocialPlatform.FACEBOOK]: {
    maxLength: 63206,
    hashtagLimit: 4,
    imageDimensions: [
      { width: 1200, height: 630, label: 'Link share' },
      { width: 1080, height: 1080, label: 'Square post' },
    ],
    features: ['Live Video', 'Stories', 'Polls'],
    bestTimes: ['Thu-Sun 1pm-4pm', 'Peak: Wed 11am-2pm'],
    tone: 'Informative and engaging',
  },
  [SocialPlatform.INSTAGRAM]: {
    maxLength: 2200,
    hashtagLimit: 5,
    imageDimensions: [
      { width: 1080, height: 1080, label: 'Square' },
      { width: 1080, height: 1350, label: 'Portrait' },
    ],
    features: ['Stories', 'Reels', 'Carousel'],
    bestTimes: ['Tue-Fri 11am-3pm', 'Peak: Wed 11am-1pm'],
    tone: 'Visual and casual',
  },
}

interface PostOptimizerProps {
  onOptimize: (optimizedContent: {
    platform: SocialPlatform
    content: string
    hashtags: string[]
  }) => void
}

export function PostOptimizer({ onOptimize }: PostOptimizerProps) {
  const [content, setContent] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>(SocialPlatform.TWITTER)

  const handleOptimize = () => {
    const optimized = ContentOptimizer.optimizeForPlatform(
      content,
      selectedPlatform,
      hashtags.split(' ').filter(Boolean)
    )

    onOptimize({
      platform: selectedPlatform,
      content: optimized.content,
      hashtags: optimized.hashtags,
    })
  }

  const specs = PLATFORM_SPECS[selectedPlatform]
  const remainingChars = specs.maxLength - content.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Optimizer</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={SocialPlatform.TWITTER} onValueChange={(value) => 
          setSelectedPlatform(value as SocialPlatform)
        }>
          <TabsList>
            {Object.values(SocialPlatform).map((platform) => (
              <TabsTrigger key={platform} value={platform}>
                {platform}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.values(SocialPlatform).map((platform) => (
            <TabsContent key={platform} value={platform}>
              <div className="space-y-4">
                <div>
                  <Label>Platform Specifications</Label>
                  <div className="mt-2 text-sm space-y-2">
                    <p>Max Length: {PLATFORM_SPECS[platform].maxLength} characters</p>
                    <p>Max Hashtags: {PLATFORM_SPECS[platform].hashtagLimit}</p>
                    <p>Tone: {PLATFORM_SPECS[platform].tone}</p>
                    <p>Best Times: {PLATFORM_SPECS[platform].bestTimes.join(', ')}</p>
                  </div>
                </div>

                <div>
                  <Label>Recommended Image Dimensions</Label>
                  <div className="mt-2 text-sm space-y-1">
                    {PLATFORM_SPECS[platform].imageDimensions.map((dim, i) => (
                      <p key={i}>
                        {dim.label}: {dim.width}x{dim.height}px
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Platform Features</Label>
                  <div className="mt-2 text-sm space-y-1">
                    {PLATFORM_SPECS[platform].features.map((feature, i) => (
                      <p key={i}>• {feature}</p>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Write your ${selectedPlatform.toLowerCase()} post...`}
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              {remainingChars} characters remaining
            </p>
          </div>

          <div className="space-y-2">
            <Label>Hashtags</Label>
            <Input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="Enter hashtags separated by spaces"
            />
            <p className="text-sm text-muted-foreground">
              Recommended: {specs.hashtagLimit} hashtags maximum
            </p>
          </div>

          <Button onClick={handleOptimize}>
            Optimize for {selectedPlatform}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}