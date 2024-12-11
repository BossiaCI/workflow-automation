import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { format } from "date-fns"

interface SubmissionTrendsProps {
  data: Array<{
    createdAt: Date
    _count: number
  }>
}

export function SubmissionTrends({ data }: SubmissionTrendsProps) {
  const chartData = data.map((item) => ({
    date: format(new Date(item.createdAt), "MMM dd"),
    submissions: item._count,
  }))

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Submission Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="submissions"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}