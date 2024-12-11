import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SocialPlatform } from '@prisma/client'

const PostNode = memo(({ data, isConnectable }: any) => {
  return (
    <Card>
      <CardContent className="p-4">
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
        <div className="space-y-4">
          <Select
            value={data.platform}
            onValueChange={(value) => {
              data.onChange?.({ platform: value })
            }}
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
            value={data.content || ''}
            onChange={(e) => data.onChange?.({ content: e.target.value })}
            placeholder="Post content"
          />
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      </CardContent>
    </Card>
  )
})
PostNode.displayName = 'PostNode'

const DelayNode = memo(({ data, isConnectable }: any) => {
  return (
    <Card>
      <CardContent className="p-4">
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
        <Input
          type="number"
          value={data.delay || ''}
          onChange={(e) => data.onChange?.({ delay: parseInt(e.target.value) })}
          placeholder="Delay (minutes)"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      </CardContent>
    </Card>
  )
})
DelayNode.displayName = 'DelayNode'

const ConditionNode = memo(({ data, isConnectable }: any) => {
  return (
    <Card>
      <CardContent className="p-4">
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
        <Input
          value={data.condition || ''}
          onChange={(e) => data.onChange?.({ condition: e.target.value })}
          placeholder="Enter condition"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          style={{ left: '25%' }}
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          style={{ left: '75%' }}
          isConnectable={isConnectable}
        />
      </CardContent>
    </Card>
  )
})
ConditionNode.displayName = 'ConditionNode'

const ActionNode = memo(({ data, isConnectable }: any) => {
  return (
    <Card>
      <CardContent className="p-4">
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
        <Input
          value={data.action || ''}
          onChange={(e) => data.onChange?.({ action: e.target.value })}
          placeholder="Enter action"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      </CardContent>
    </Card>
  )
})
ActionNode.displayName = 'ActionNode'

export const WorkflowNodeTypes = {
  post: PostNode,
  delay: DelayNode,
  condition: ConditionNode,
  action: ActionNode,
}