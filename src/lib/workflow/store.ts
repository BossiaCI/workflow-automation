import { create } from 'zustand'
import { Node, Edge, Connection, addEdge } from 'reactflow'
import { WorkflowNode, WorkflowEdge, WorkflowValidation, WorkflowExecutionStatus } from './types'
import { validateWorkflow } from './validation'

interface WorkflowState {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  validation: WorkflowValidation
  executionStatus: WorkflowExecutionStatus
  selectedNode: WorkflowNode | null
  setNodes: (nodes: WorkflowNode[]) => void
  setEdges: (edges: WorkflowEdge[]) => void
  addNode: (node: WorkflowNode) => void
  updateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void
  removeNode: (nodeId: string) => void
  onNodesChange: (changes: any[]) => void
  onEdgesChange: (changes: any[]) => void
  onConnect: (connection: Connection) => void
  validateWorkflow: () => void
  setExecutionStatus: (status: Partial<WorkflowExecutionStatus>) => void
  selectNode: (node: WorkflowNode | null) => void
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  validation: { isValid: true, errors: [] },
  executionStatus: {
    status: 'idle',
    history: [],
  },
  selectedNode: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }))
  },

  updateNode: (nodeId, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
    }))
  },

  removeNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
    }))
  },

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: changes.reduce((nodes, change) => {
        // Handle node changes
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
        // Handle edge changes
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

  validateWorkflow: () => {
    const { nodes, edges } = get()
    const validation = validateWorkflow(nodes, edges)
    set({ validation })
  },

  setExecutionStatus: (status) => {
    set((state) => ({
      executionStatus: { ...state.executionStatus, ...status },
    }))
  },

  selectNode: (node) => {
    set({ selectedNode: node })
  },
}))

export const useSelectedNode = () => useWorkflowStore((state) => state.selectedNode)
export const useWorkflowValidation = () => useWorkflowStore((state) => state.validation)
export const useExecutionStatus = () => useWorkflowStore((state) => state.executionStatus)