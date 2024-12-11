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
import { workflowTemplates } from '@/lib/workflow/templates'
import { useWorkflowStore } from '@/lib/workflow/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function WorkflowTemplatesDialog() {
  const [open, setOpen] = useState(false)
  const { setNodes, setEdges } = useWorkflowStore()

  const handleSelectTemplate = (templateId: string) => {
    const template = workflowTemplates[templateId]
    if (!template) return

    // Generate unique IDs for nodes
    const nodeIdMap: Record<string, string> = {}
    const nodes = template.nodes.map((node) => {
      const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      nodeIdMap[node.id] = newId
      return {
        id: newId,
        type: node.type,
        position: node.position,
        data: node.data,
      }
    })

    // Update edge references
    const edges = template.edges.map((edge) => ({
      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: nodeIdMap[edge.source],
      target: nodeIdMap[edge.target],
      data: edge.data,
    }))

    setNodes(nodes)
    setEdges(edges)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Use Template</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Workflow Templates</DialogTitle>
          <DialogDescription>
            Choose a template to start with. You can customize it after.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 md:grid-cols-2">
          {Object.entries(workflowTemplates).map(([id, template]) => (
            <Card
              key={id}
              className="cursor-pointer hover:border-primary"
              onClick={() => handleSelectTemplate(id)}
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
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}