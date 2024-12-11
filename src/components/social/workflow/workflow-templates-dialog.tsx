import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkflowStore } from './workflow-store'
import { useToast } from '@/components/ui/use-toast'

export function WorkflowTemplatesDialog() {
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { setNodes, setEdges } = useWorkflowStore()
  const { toast } = useToast()

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/social/workflows/templates')
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load workflow templates',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectTemplate = (template: any) => {
    setNodes(template.nodes)
    setEdges(template.edges)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={fetchTemplates}>
          Use Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Workflow Templates</DialogTitle>
          <DialogDescription>
            Choose a template to start with. You can customize it after.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 md:grid-cols-2">
          {isLoading ? (
            <div>Loading templates...</div>
          ) : templates.length === 0 ? (
            <div>No templates found</div>
          ) : (
            templates.map((template: any) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {template.nodes.length} nodes, {template.edges.length} connections
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}