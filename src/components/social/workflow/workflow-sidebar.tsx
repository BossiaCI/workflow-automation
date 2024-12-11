import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Clock,
  GitBranch,
  Zap,
} from 'lucide-react'

interface WorkflowSidebarProps {
  onAddNode: (type: string) => void
}

const NODE_TYPES = [
  {
    type: 'post',
    label: 'Social Post',
    icon: MessageSquare,
    description: 'Create and schedule social media posts',
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    description: 'Add a time delay between steps',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: GitBranch,
    description: 'Add conditional logic to your workflow',
  },
  {
    type: 'action',
    label: 'Action',
    icon: Zap,
    description: 'Perform an automated action',
  },
]

export function WorkflowSidebar({ onAddNode }: WorkflowSidebarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Steps</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}