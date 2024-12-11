import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SocialPlatform } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
import { MediaUploader } from './media-uploader'
import { ContentOptimizer } from '@/lib/social/content-optimizer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const postSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  hashtags: z.string(),
  platforms: z.array(z.enum(['TWITTER', 'LINKEDIN', 'FACEBOOK', 'INSTAGRAM'])),
  scheduledFor: z.date().optional(),
  mediaUrls: z.array(z.string()).optional(),
})

export function PostComposer() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([])
  const [mediaFiles, setMediaFiles] = useState<string[]>([])
  const [schedulePost, setSchedulePost] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date | null>(props.initialScheduledDate || null)

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
      hashtags: '',
      platforms: [],
      mediaUrls: [],
    },
  })

  const onSubmit = async (data: z.infer<typeof postSchema>) => {
    try {
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          hashtags: data.hashtags.split(' ').filter(Boolean),
          platforms: selectedPlatforms,
          scheduledFor: scheduledDate?.toISOString(),
          mediaUrls: mediaFiles,
        }),
      })

      if (!response.ok) throw new Error('Failed to create post')

      form.reset()
      setMediaFiles([])
      setSelectedPlatforms([])
      props.onSuccess?.()
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="compose">
            <TabsList>
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="compose" className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  {...form.register('content')}
                  placeholder="What's on your mind?"
                  className="min-h-[100px]"
                />
                <Input
                  {...form.register('hashtags')}
                  placeholder="Add hashtags (space separated)"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.values(SocialPlatform).map(platform => (
                  <Button
                    key={platform}
                    type="button"
                    variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                    onClick={() => handlePlatformToggle(platform)}
                  >
                    {platform}
                  </Button>
                ))}
              </div>

              <MediaUploader
                onUploadComplete={(urls) => setMediaFiles(prev => [...prev, ...urls])}
                maxFiles={4}
              />

              <div className="flex items-center space-x-2">
                <Switch
                  checked={schedulePost}
                  onCheckedChange={(checked) => {
                    setSchedulePost(checked)
                    if (!checked) setScheduledDate(null)
                  }}
                />
                <span>Schedule post</span>
              </div>

              {schedulePost && (
                <div className="space-y-4">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date()}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={scheduledDate?.toLocaleTimeString() || ''}
                      onChange={(e) => {
                        if (scheduledDate) {
                          const [hours, minutes] = e.target.value.split(':')
                          const newDate = new Date(scheduledDate)
                          newDate.setHours(parseInt(hours), parseInt(minutes))
                          setScheduledDate(newDate)
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview">
              {selectedPlatforms.map(platform => {
                const optimized = ContentOptimizer.optimizeForPlatform(
                  form.getValues('content'),
                  platform,
                  form.getValues('hashtags').split(' ').filter(Boolean)
                )

                return (
                  <div key={platform} className="mb-4">
                    <h3 className="font-medium mb-2">{platform}</h3>
                    <div className="p-4 border rounded-lg">
                      <p className="whitespace-pre-wrap">{optimized.content}</p>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {optimized.hashtags.join(' ')}
                      </div>
                    </div>
                  </div>
                )
              })}
            </TabsContent>
          </Tabs>

          <Button type="submit" disabled={selectedPlatforms.length === 0}>
            {schedulePost ? 'Schedule Post' : 'Post Now'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}