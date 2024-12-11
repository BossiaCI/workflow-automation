import { useCallback } from 'react'
import ReactFlow, {
  Background,
  Controls,
  Panel,
} from 'reactflow'
import { useWorkflowStore } from '@/lib/workflow/store'
import { WorkflowNode } from '@/lib/workflow/types'
import { WorkflowControls } from './workflow-controls'
import { WorkflowSidebar } from './workflow-sidebar'
import { WorkflowNodeTypes } from './workflow-nodes'
import { WorkflowTemplatesDialog } from './workflow-templates-dialog'
import 'reactflow/dist/style.css'

export function WorkflowBuilder() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
  } = useWorkflowStore()

  const onNodeClick = useCallback((event: React.MouseEvent, node: WorkflowNode) => {
    selectNode(node)
  }, [selectNode])

  return (
    <div className="h-[800px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode={["Control", "Meta"]}
        snapToGrid={true}
        snapGrid={[10, 10]}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={WorkflowNodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <Panel position="top-right">
          <div className="flex gap-2">
            <WorkflowTemplatesDialog />
            <WorkflowControls workflowId={workflowId} />
          </div>
        </Panel>
      </ReactFlow>
      <WorkflowSidebar />
    </div>
  )
}