import { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostComposer } from "@/components/social/post-composer"
import { ContentCalendar } from "@/components/social/content-calendar"
import { AnalyticsDashboard } from "@/components/social/analytics-dashboard"

export const metadata: Metadata = {
  title: "Social Media Management",
  description: "Manage and schedule your social media content",
}

export default function SocialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Social Media</h2>
        <p className="text-muted-foreground">
          Create, schedule, and analyze your social media content
        </p>
      </div>

      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <PostComposer />
        </TabsContent>

        <TabsContent value="calendar">
          <ContentCalendar />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard data={[]} />
        </TabsContent>
      </Tabs>
    </div>
  )
}