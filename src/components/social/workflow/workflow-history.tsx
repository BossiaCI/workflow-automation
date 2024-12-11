import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface WorkflowHistory {
  id: string
  status: string
  error?: string
  metadata: any
  createdAt: string
}

interface WorkflowHistoryProps {
  workflowId?: string
}

export function WorkflowHistory({ workflowId }: WorkflowHistoryProps) {
  const [history, setHistory] = useState<WorkflowHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [workflowId])

  const fetchHistory = async () => {
    try {
      const url = new URL('/api/social/workflows/history', window.location.origin)
      if (workflowId) {
        url.searchParams.set('workflowId', workflowId)
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch history')
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading history...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {history.map((entry) => (
              <Alert
                key={entry.id}
                variant={entry.status === 'COMPLETED' ? 'default' : 'destructive'}
              >
                {entry.status === 'COMPLETED' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div className="flex justify-between">
                    <span>{entry.status}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                  {entry.error && (
                    <p className="text-sm text-destructive mt-1">
                      Error: {entry.error}
                    </p>
                  )}
                  {entry.metadata?.history?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {entry.metadata.history.map((step: any, index: number) => (
                        <div
                          key={index}
                          className="text-sm flex justify-between items-center"
                        >
                          <span>Node: {step.nodeId}</span>
                          <span className="text-muted-foreground">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}