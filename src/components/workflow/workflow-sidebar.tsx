import { useSelectedNode } from '@/lib/workflow/store'
import { NodeProperties } from './node-properties'
import { NodePalette } from './node-palette'

export function WorkflowSidebar() {
  const selectedNode = useSelectedNode()

  return (
    <div className="fixed right-0 top-0 h-full w-80 border-l bg-background p-4">
      {selectedNode ? (
        <NodeProperties node={selectedNode} />
      ) : (
        <NodePalette />
      )}
    </div>
  )
}