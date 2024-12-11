import { create } from 'zustand'
import { Node, Edge, Connection, addEdge } from 'reactflow'

interface WorkflowState {
  nodes: Node[]
  edges: Edge[]
  selectedNode: Node | null
  validation: {
    isValid: boolean
    errors: Array<{ nodeId: string; message: string }>
  }
  execution: {
    status: 'idle' | 'running' | 'completed' | 'error'
    history: Array<{
      nodeId: string
      timestamp: number
      status: 'completed' | 'error'
      error?: string
    }>
  }
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  onNodesChange: (changes: any[]) => void
  onEdgesChange: (changes: any[]) => void
  onConnect: (connection: Connection) => void
  selectNode: (node: Node | null) => void
  updateNodeData: (nodeId: string, data: any) => void
  setValidation: (validation: WorkflowState['validation']) => void
  setExecution: (execution: Partial<WorkflowState['execution']>) => void
  resetExecution: () => void
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  validation: {
    isValid: true,
    errors: [],
  },
  execution: {
    status: 'idle',
    history: [],
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: changes.reduce((nodes, change) => {
        if (change.type === 'position' && change.position) {
          return nodes.map((node) =>
            node.id === change.id
              ? { ...node, position: change.position }
              : node
          )
        }
        return nodes
      }, [...state.nodes]),
    }))
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: changes.reduce((edges, change) => {
        if (change.type === 'remove') {
          return edges.filter((edge) => edge.id !== change.id)
        }
        return edges
      }, [...state.edges]),
    }))
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
    }))
  },

  selectNode: (node) => set({ selectedNode: node }),

  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    }))
  },

  setValidation: (validation) => set({ validation }),

  setExecution: (execution) =>
    set((state) => ({
      execution: { ...state.execution, ...execution },
    })),

  resetExecution: () =>
    set({
      execution: {
        status: 'idle',
        history: [],
      },
    }),
}))

export const useSelectedNode = () => useWorkflowStore((state) => state.selectedNode)
export const useWorkflowValidation = () => useWorkflowStore((state) => state.validation)
export const useWorkflowExecution = () => useWorkflowStore((state) => state.execution)