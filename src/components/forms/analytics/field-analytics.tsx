import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface FieldAnalytics {
  fieldId: string
  label: string
  completionRate: number
  avgTimeSpent: number
}

interface FieldAnalyticsProps {
  analytics: FieldAnalytics[]
}

export function FieldAnalytics({ analytics }: FieldAnalyticsProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Field Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analytics.map((field) => (
          <div key={field.fieldId} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{field.label}</span>
              <span className="text-muted-foreground">
                {field.completionRate}% completion
              </span>
            </div>
            <Progress value={field.completionRate} />
            <p className="text-xs text-muted-foreground">
              Average time spent: {field.avgTimeSpent.toFixed(1)}s
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}