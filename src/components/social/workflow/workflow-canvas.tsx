import { useCallback } from 'react'
import ReactFlow, {
  Background,
  Controls,
  Panel,
  Connection,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WorkflowNodeTypes } from './workflow-nodes'
import { WorkflowControls } from './workflow-controls'
import { WorkflowSidebar } from './workflow-sidebar'
import { useToast } from '@/components/ui/use-toast'
import 'reactflow/dist/style.css'

const initialNodes = []
const initialEdges = []

export function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const { toast } = useToast()

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleAddNode = (type: string) => {
    const position = {
      x: Math.random() * 500,
      y: Math.random() * 500,
    }

    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { label: type },
    }

    setNodes((nds) => [...nds, newNode])
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/social/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      })

      if (!response.ok) throw new Error('Failed to save workflow')

      toast({
        title: 'Success',
        description: 'Workflow saved successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save workflow',
        variant: 'destructive',
      })
    }
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
              <Panel position="top-right">
                <div className="flex gap-2">
                  <WorkflowControls onSave={handleSave} />
                </div>
              </Panel>
            </ReactFlow>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-3">
        <WorkflowSidebar onAddNode={handleAddNode} />
      </div>
    </div>
  )
}