import { Button } from "@/components/ui/button"
import { useReactFlow } from "reactflow"
import { Play, Save, RotateCcw, CheckCircle2, Loader2 } from "lucide-react"
import { useWorkflowStore } from "./workflow-store"
import { useToast } from "@/components/ui/use-toast"
import { WorkflowExecutor } from "@/lib/social/workflow/executor"
import { WorkflowExecutor } from "@/lib/social/workflow/executor"
import { WorkflowExecutor } from "@/lib/social/workflow/executor"

export function WorkflowControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const { nodes, edges, setValidation, setExecution, validation } = useWorkflowStore()
  const { toast } = useToast()
  const [isExecuting, setIsExecuting] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  const handleValidate = async () => {
    try {
      const response = await fetch("/api/social/workflows/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      })

      if (!response.ok) throw new Error("Validation failed")

      const result = await response.json()
      setValidation(result)

      if (result.isValid) {
        toast({
          title: "Success",
          description: "Workflow validation passed",
        })
      } else {
        toast({
          title: "Validation Failed",
          description: `Found ${result.errors.length} error(s)`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate workflow",
        variant: "destructive",
      })
    }
  }

  const handleExecute = async () => {
    if (!validation.isValid) {
      await handleValidate()
      return
    }

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
        history: result.history,
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

  const handleExecute = async () => {
    if (!validation.isValid) {
      await handleValidate()
      return
    }

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
        history: result.history,
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

  const handleExecute = async () => {
    if (!validation.isValid) {
      await handleValidate()
      return
    }

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
        history: result.history,
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
    <div className="flex gap-2">
      <Button onClick={() => fitView()}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset View
      </Button>
      <Button onClick={handleValidate}>
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Validate
      </Button>
      <Button onClick={handleExecute} disabled={isExecuting}>
        {isExecuting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Executing...
      <Button onClick={handleExecute} disabled={isExecuting}>
        {isExecuting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Executing...
      <Button onClick={handleExecute} disabled={isExecuting}>
        {isExecuting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Executing...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Run
          </>
        )}
      </Button>
      <Button>
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>
    </div>
  )
}