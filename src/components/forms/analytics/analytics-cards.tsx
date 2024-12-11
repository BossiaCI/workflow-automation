import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Users, Eye, FileText, Clock } from "lucide-react"

interface AnalyticsCardsProps {
  analytics: {
    views: number
    submissions: number
    averageTime: number
    form: {
      title: string
      type: string
      createdAt: string
    }
  }
}

export function AnalyticsCards({ analytics }: AnalyticsCardsProps) {
  const conversionRate = analytics.views > 0 
    ? ((analytics.submissions / analytics.views) * 100).toFixed(1) 
    : "0"

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Views
          </CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.views}</div>
          <p className="text-xs text-muted-foreground">
            Since {formatDate(analytics.form.createdAt)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Submissions
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.submissions}</div>
          <p className="text-xs text-muted-foreground">
            Form responses received
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Time
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics.averageTime.toFixed(1)}s
          </div>
          <p className="text-xs text-muted-foreground">
            Average completion time
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Conversion Rate
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground">
            Of views converted to submissions
          </p>
        </CardContent>
      </Card>
    </div>
  )
}