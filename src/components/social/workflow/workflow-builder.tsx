import { useCallback } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WorkflowNodeTypes } from './workflow-nodes'
import { WorkflowControls } from './workflow-controls'
import { WorkflowSidebar } from './workflow-sidebar'
import { WorkflowValidation } from './workflow-validation'
import { WorkflowExecutionPanel } from './workflow-execution-panel'
import { WorkflowValidation } from './workflow-validation'
import { WorkflowExecutionPanel } from './workflow-execution-panel'
import { WorkflowValidation } from './workflow-validation'
import { WorkflowExecutionPanel } from './workflow-execution-panel'
import 'reactflow/dist/style.css'

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

export function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleAddNode = (type: string) => {
    const position = {
      x: Math.random() * 500,
      y: Math.random() * 500,
    }

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { label: type },
    }

    setNodes((nds) => [...nds, newNode])
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-9">
        <Card className="h-[800px]">
          <CardHeader>
            <CardTitle>Workflow Builder</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={WorkflowNodeTypes}
              fitView
              deleteKeyCode={["Backspace", "Delete"]}
              multiSelectionKeyCode={["Control", "Meta"]}
              snapToGrid={true}
              snapGrid={[10, 10]}
            >
              <Background />
              <Controls />
              <MiniMap />
              <Panel position="top-right">
                <WorkflowControls />
              </Panel>
            </ReactFlow>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-3">
        <div className="space-y-6">
          <WorkflowSidebar onAddNode={handleAddNode} />
          <WorkflowValidation />
          <WorkflowExecutionPanel />
        <div className="space-y-6">
          <WorkflowSidebar onAddNode={handleAddNode} />
          <WorkflowValidation />
          <WorkflowExecutionPanel />
        <div className="space-y-6">
          <WorkflowSidebar onAddNode={handleAddNode} />
          <WorkflowValidation />
          <WorkflowExecutionPanel />
        </div>
      </div>
    </div>
  )
}