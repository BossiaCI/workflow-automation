import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDate } from '@/lib/utils'
import { History, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface WorkflowHistory {
  id: string
  createdAt: string
  metadata: {
    status: string
    history: {
      nodeId: string
      timestamp: number
      status: string
      error?: string
    }[]
    error?: string
  }
}

export function WorkflowHistoryDialog({ workflowId }: { workflowId: string }) {
  const [history, setHistory] = useState<WorkflowHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      setError(undefined)
      const response = await fetch(`/api/workflows/${workflowId}/history`)
      if (!response.ok) throw new Error('Failed to fetch history')
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      console.error('Error fetching history:', error)
      setError('Failed to load execution history')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={fetchHistory}>
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Execution History</DialogTitle>
          <DialogDescription>
            View past workflow executions and their results
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              Loading history...
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : history.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No execution history found
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {formatDate(entry.createdAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      {entry.metadata.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={
                          entry.metadata.status === 'completed'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {entry.metadata.status}
                      </span>
                    </div>
                  </div>
                  {entry.metadata.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{entry.metadata.error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-1 mt-4">
                    {entry.metadata.history.map((step, index) => (
                      <div
                        key={index}
                        className="text-sm flex items-center justify-between p-2 rounded-md bg-muted/50"
                      >
                        <span>{step.nodeId}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </span>
                          <span
                            className={
                              step.status === 'completed'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {step.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}