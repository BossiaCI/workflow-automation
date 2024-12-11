import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { cn } from '@/lib/utils'
import {
  Play,
  CheckSquare,
  Clock,
  Mail,
  Square,
  FileText,
  GitCommit,
} from 'lucide-react'

const BaseNode = memo(({ data, type, isConnectable }: any) => {
  const Icon = {
    start: Play,
    task: CheckSquare,
    condition: GitCommit,
    delay: Clock,
    email: Mail,
    pdf: FileText,
    end: Square,
  }[type]

  return (
    <div
      className={cn(
        'px-4 py-2 shadow-lg rounded-lg border bg-background min-w-[150px]',
        data.validation?.isValid === false && 'border-destructive',
        type === 'start' && 'border-green-500',
        type === 'end' && 'border-red-500'
      )}
    >
      {type !== 'start' && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
      )}
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <div className="text-sm font-medium">{data.label}</div>
        {data.template && (
          <span className="text-xs text-muted-foreground ml-2">
            {data.template.name}
          </span>
        )}
      </div>
      {type !== 'end' && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
    </div>
  )
})
BaseNode.displayName = 'BaseNode'

export const WorkflowNodeTypes = {
  start: BaseNode,
  task: BaseNode,
  condition: BaseNode,
  delay: BaseNode,
  email: BaseNode,
  end: BaseNode,
}