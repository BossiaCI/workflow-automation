import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Clock,
  GitBranch,
  Zap,
} from 'lucide-react'

interface WorkflowNodeListProps {
  onAddNode: (type: 'post' | 'delay' | 'condition' | 'action') => void
}

const NODE_TYPES = [
  {
    type: 'post' as const,
    label: 'Social Post',
    icon: MessageSquare,
    description: 'Create and schedule social media posts',
  },
  {
    type: 'delay' as const,
    label: 'Delay',
    icon: Clock,
    description: 'Add a time delay between steps',
  },
  {
    type: 'condition' as const,
    label: 'Condition',
    icon: GitBranch,
    description: 'Add conditional logic to your workflow',
  },
  {
    type: 'action' as const,
    label: 'Action',
    icon: Zap,
    description: 'Perform an automated action',
  },
]

export function WorkflowNodeList({ onAddNode }: WorkflowNodeListProps) {
  return (
    <div className="space-y-2">
      {NODE_TYPES.map((node) => {
        const Icon = node.icon
        return (
          <Button
            key={node.type}
            variant="outline"
            className="w-full justify-start gap-2 h-auto py-4"
            onClick={() => onAddNode(node.type)}
          >
            <Icon className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">{node.label}</div>
              <div className="text-xs text-muted-foreground">
                {node.description}
              </div>
            </div>
          </Button>
        )
      })}
    </div>
  )
}