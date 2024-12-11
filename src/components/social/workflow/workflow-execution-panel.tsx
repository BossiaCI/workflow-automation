import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import { Play, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useWorkflowStore } from './workflow-store'

export function WorkflowExecutionPanel() {
  const { nodes, edges, execution, setExecution } = useWorkflowStore()
  const [isExecuting, setIsExecuting] = useState(false)
  const { toast } = useToast()

  const handleExecute = async () => {
    try {
      setIsExecuting(true)
      setExecution({ status: 'running', history: [] })

      const response = await fetch('/api/social/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      })

      if (!response.ok) throw new Error('Execution failed')

      const result = await response.json()
      setExecution({
        status: result.success ? 'completed' : 'error',
        history: result.history || [],
      })

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Workflow executed successfully',
        })
      } else {
        throw new Error(result.error || 'Execution failed')
      }
    } catch (error) {
      setExecution({
        status: 'error',
        history: [],
      })
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Execution History</CardTitle>
          <Button
            onClick={handleExecute}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isExecuting ? 'Executing...' : 'Execute'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {execution.history.map((entry, index) => (
              <Alert
                key={index}
                variant={entry.status === 'completed' ? 'default' : 'destructive'}
              >
                {entry.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div className="flex justify-between">
                    <span>Node: {entry.nodeId}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {entry.error && (
                    <p className="text-sm text-destructive mt-1">
                      Error: {entry.error}
                    </p>
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