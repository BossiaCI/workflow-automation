import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SocialPlatform } from '@prisma/client'
import { GripVertical, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkflowNodeProps {
  step: {
    id: string
    type: 'post' | 'delay' | 'condition' | 'action'
    platform?: SocialPlatform
    content?: string
    delay?: number
    condition?: string
  }
  onUpdate: (updates: Partial<typeof step>) => void
  onRemove: () => void
  overlay?: boolean
}

export function WorkflowNode({
  step,
  onUpdate,
  onRemove,
  overlay,
}: WorkflowNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: step.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const renderContent = () => {
    switch (step.type) {
      case 'post':
        return (
          <div className="space-y-4">
            <Select
              value={step.platform}
              onValueChange={(value: SocialPlatform) =>
                onUpdate({ platform: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SocialPlatform).map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={step.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Post content"
            />
          </div>
        )

      case 'delay':
        return (
          <Input
            type="number"
            value={step.delay || ''}
            onChange={(e) => onUpdate({ delay: parseInt(e.target.value) })}
            placeholder="Delay (minutes)"
          />
        )

      case 'condition':
        return (
          <Input
            value={step.condition || ''}
            onChange={(e) => onUpdate({ condition: e.target.value })}
            placeholder="Enter condition"
          />
        )

      default:
        return null
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        overlay && 'shadow-lg cursor-grabbing'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            className="cursor-grab p-1 h-auto"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          <span className="font-medium capitalize">{step.type}</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {renderContent()}
      </CardContent>
    </Card>
  )
}