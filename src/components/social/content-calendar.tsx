import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PostComposer } from './post-composer'
import { useQuery } from '@tanstack/react-query'
import { PostStatus, SocialPlatform } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'

interface ScheduledPost {
  id: string
  content: string
  platform: SocialPlatform
  scheduledFor: string
  status: PostStatus
}

export function ContentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  
  const { data: scheduledPosts, refetch } = useQuery<ScheduledPost[]>({
    queryKey: ['scheduledPosts'],
    queryFn: async () => {
      const response = await fetch('/api/social/posts?status=SCHEDULED')
      if (!response.ok) throw new Error('Failed to fetch scheduled posts')
      return response.json()
    },
  })

  const calendarEvents = scheduledPosts?.map(post => ({
    id: post.id,
    title: `${post.platform}: ${post.content.substring(0, 30)}...`,
    start: post.scheduledFor,
    extendedProps: {
      platform: post.platform,
      status: post.status,
    },
  })) || []

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start)
    setShowComposer(true)
  }

  const handleEventClick = async (clickInfo: any) => {
    const postId = clickInfo.event.id
    // Implement event details view or edit functionality
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Content Calendar</CardTitle>
        <Dialog open={showComposer} onOpenChange={setShowComposer}>
          <DialogTrigger asChild>
            <Button>Create Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedDate
                  ? `Schedule Post for ${selectedDate.toLocaleDateString()}`
                  : 'Create Post'}
              </DialogTitle>
            </DialogHeader>
            <PostComposer
              initialScheduledDate={selectedDate}
              onSuccess={() => {
                setShowComposer(false)
                refetch()
              }}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          selectable={true}
          select={handleDateSelect}
          events={calendarEvents}
          eventClick={handleEventClick}
          nowIndicator={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '09:00',
            endTime: '17:00',
          }}
          eventContent={(eventInfo) => (
            <div className="p-1 rounded bg-primary/10">
              <div className="text-xs font-medium">{eventInfo.event.title}</div>
              <div className="text-xs text-muted-foreground">
                {eventInfo.event.extendedProps.platform}
              </div>
            </div>
          )}
          eventClassNames={(arg) => [
            arg.event.extendedProps.status === 'SCHEDULED' ? 'opacity-75' : '',
            `platform-${arg.event.extendedProps.platform.toLowerCase()}`,
          ]}
        />
      </CardContent>
    </Card>
  )
}