import { Button } from '@/components/ui/button'
import { useWorkflowStore } from '@/lib/workflow/store'
import { WorkflowNodeType } from '@/lib/workflow/types'
import {
  Play,
  CheckSquare,
  Clock,
  Mail,
  Square,
  GitCommit,
} from 'lucide-react'

const NODE_TYPES: { type: WorkflowNodeType; label: string; icon: any }[] = [
  { type: 'start', label: 'Start', icon: Play },
  { type: 'task', label: 'Task', icon: CheckSquare },
  { type: 'condition', label: 'Condition', icon: GitCommit },
  { type: 'delay', label: 'Delay', icon: Clock },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'end', label: 'End', icon: Square },
]

export function NodePalette() {
  const { addNode } = useWorkflowStore()

  const handleDragStart = (event: React.DragEvent, type: WorkflowNodeType) => {
    event.dataTransfer.setData('application/reactflow', type)
  }

  const handleAddNode = (type: WorkflowNodeType) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100, y: 100 },
      data: { label: type.charAt(0).toUpperCase() + type.slice(1) },
    }
    addNode(newNode)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Node Types</h3>
      <div className="grid grid-cols-2 gap-2">
        {NODE_TYPES.map(({ type, label, icon: Icon }) => (
          <Button
            key={type}
            variant="outline"
            className="flex flex-col items-center gap-2 h-20"
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            onClick={() => handleAddNode(type)}
          >
            <Icon className="h-6 w-6" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}