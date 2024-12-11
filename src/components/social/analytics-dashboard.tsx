import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { SocialPlatform } from '@prisma/client'

interface AnalyticsDashboardProps {
  data: {
    platform: SocialPlatform
    stats: {
      date: string
      impressions: number
      engagement: number
      clicks: number
    }[]
  }[]
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reduce((acc, platform) => acc + platform.stats.length, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reduce((acc, platform) => 
                acc + platform.stats.reduce((sum, stat) => sum + stat.impressions, 0), 
              0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reduce((acc, platform) => 
                acc + platform.stats.reduce((sum, stat) => sum + stat.engagement, 0), 
              0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reduce((acc, platform) => 
                acc + platform.stats.reduce((sum, stat) => sum + stat.clicks, 0), 
              0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="pt-6">
        <Tabs defaultValue="overview">
          <TabsList className="px-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {data.map(platform => (
              <TabsTrigger key={platform.platform} value={platform.platform}>
                {platform.platform}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data[0]?.stats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="impressions" stroke="#8884d8" />
                  <Line type="monotone" dataKey="engagement" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="clicks" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </TabsContent>

          {data.map(platform => (
            <TabsContent key={platform.platform} value={platform.platform}>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={platform.stats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="impressions" stroke="#8884d8" />
                    <Line type="monotone" dataKey="engagement" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="clicks" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  )
}