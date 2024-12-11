import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { EmailWorkflowDialog } from "./email-workflow-dialog"
import { EmailWorkflowList } from "./email-workflow-list"

export function EmailWorkflows() {
  const [workflows, setWorkflows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    try {
      const response = await fetch("/api/email/workflows")
      if (!response.ok) throw new Error("Failed to fetch workflows")
      const data = await response.json()
      setWorkflows(data)
    } catch (error) {
      console.error("Error fetching workflows:", error)
      toast({
        title: "Error",
        description: "Failed to fetch email workflows",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/email/workflows/${workflowId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete workflow")
      
      setWorkflows(workflows.filter(w => w.id !== workflowId))
      toast({
        title: "Success",
        description: "Workflow deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Email Workflows</CardTitle>
        <EmailWorkflowDialog onSave={fetchWorkflows} />
      </CardHeader>
      <CardContent>
        <EmailWorkflowList
          workflows={workflows}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={fetchWorkflows}
        />
      </CardContent>
    </Card>
  )
}