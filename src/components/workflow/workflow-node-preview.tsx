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
import { ScrollArea } from '@/components/ui/scroll-area'
import { WorkflowNode } from '@/lib/workflow/types'
import { Eye } from 'lucide-react'

interface NodePreviewProps {
  node: WorkflowNode
  context?: Record<string, any>
}

export function WorkflowNodePreview({ node, context }: NodePreviewProps) {
  const [previewData, setPreviewData] = useState<any>(null)

  const generatePreview = async () => {
    try {
      switch (node.type) {
        case 'email':
          const response = await fetch(`/api/email/templates/${node.data.properties?.templateId}/preview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context }),
          })
          const data = await response.json()
          setPreviewData(data)
          break
        // Add other node type previews
      }
    } catch (error) {
      console.error('Error generating preview:', error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" onClick={generatePreview}>
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Node Preview</DialogTitle>
          <DialogDescription>
            Preview the output of this node with current context
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px]">
          {node.type === 'email' && previewData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Subject</h3>
                <p className="text-sm">{previewData.subject}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Content</h3>
                <iframe
                  srcDoc={previewData.html}
                  className="w-full h-[300px] border rounded-lg"
                />
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}