import { Metadata } from "next"
import { getFormAnalytics, getSubmissionTrends } from "@/lib/api/form-analytics"
import { AnalyticsCards } from "@/components/forms/analytics/analytics-cards"
import { SubmissionTrends } from "@/components/forms/analytics/submission-trends"
import { FieldAnalytics } from "@/components/forms/analytics/field-analytics"

export const metadata: Metadata = {
  title: "Form Analytics",
  description: "Detailed analytics and insights for your form",
}

interface Props {
  params: {
    formId: string
  }
}

export default async function FormAnalyticsPage({ params }: Props) {
  const [analytics, trends] = await Promise.all([
    getFormAnalytics(params.formId),
    getSubmissionTrends(params.formId),
  ])

  if (!analytics) {
    return <div>Form not found</div>
  }

  // Calculate field-specific analytics
  const fieldAnalytics = Object.entries(analytics.form.fields).map(([id, field]: [string, any]) => {
    const submissions = analytics.form.submissions || []
    const completedCount = submissions.filter(sub => sub.data[id]).length
    const completionRate = submissions.length > 0 
      ? (completedCount / submissions.length) * 100 
      : 0

    return {
      fieldId: id,
      label: field.label,
      completionRate,
      avgTimeSpent: Math.random() * 10 + 5, // This would be replaced with actual timing data
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Analytics for {analytics.form.title}
        </h2>
        <p className="text-muted-foreground">
          Detailed insights and performance metrics
        </p>
      </div>
      
      <AnalyticsCards analytics={analytics} />
      <SubmissionTrends data={trends} />
      <FieldAnalytics analytics={fieldAnalytics} />
    </div>
  )
}