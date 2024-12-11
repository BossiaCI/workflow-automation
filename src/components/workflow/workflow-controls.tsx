import { Button } from '@/components/ui/button'
import { useWorkflowStore, useWorkflowValidation, useExecutionStatus } from '@/lib/workflow/store'
import { Play, Pause, RotateCcw, Save, Layout, History } from 'lucide-react'
import { autoLayout } from '@/lib/workflow/layout'
import { WorkflowHistoryDialog } from './workflow-history-dialog'

export function WorkflowControls({ workflowId }: { workflowId?: string }) {
  const { validateWorkflow, setExecutionStatus, nodes, edges, setNodes } = useWorkflowStore()
  const validation = useWorkflowValidation()
  const executionStatus = useExecutionStatus()

  const handleValidate = () => {
    validateWorkflow()
  }

  const handleExecute = () => {
    if (!validation.isValid) {
      handleValidate()
      return
    }

    setExecutionStatus({
      status: 'running',
      currentNodeId: undefined,
      history: [],
    })
  }

  const handlePause = () => {
    setExecutionStatus({ status: 'paused' })
  }

  const handleReset = () => {
    setExecutionStatus({
      status: 'idle',
      currentNodeId: undefined,
      history: [],
    })
  }

  const handleAutoLayout = () => {
    const layoutedNodes = autoLayout(nodes, edges)
    setNodes(layoutedNodes)
  }

  return (
    <div className="flex gap-2">
      {executionStatus.status === 'running' ? (
        <Button onClick={handlePause}>
          <Pause className="h-4 w-4 mr-2" />
          Pause
        </Button>
      ) : (
        <Button onClick={handleExecute}>
          <Play className="h-4 w-4 mr-2" />
          Execute
        </Button>
      )}
      <Button variant="outline" onClick={handleReset}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset
      </Button>
      <Button variant="outline" onClick={handleValidate}>
        Validate
      </Button>
      <Button variant="outline" onClick={handleAutoLayout}>
        <Layout className="h-4 w-4 mr-2" />
        Auto Layout
      </Button>
      {workflowId && <WorkflowHistoryDialog workflowId={workflowId} />}
      <Button>
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>
    </div>
  )
}