import { Node, Edge } from 'reactflow'

export type WorkflowNodeType = 
  | 'start'
  | 'task'
  | 'condition'
  | 'delay'
  | 'email'
  | 'pdf'
  | 'end'

export interface WorkflowNode extends Node {
  type: WorkflowNodeType
  data: {
    label: string
    properties?: Record<string, any>
    template?: {
      id: string
      name: string
    }
    validation?: {
      isValid: boolean
      message?: string
    }
  }
}

export interface WorkflowEdge extends Edge {
  data?: {
    condition?: string
  }
}

export interface WorkflowValidation {
  isValid: boolean
  errors: {
    nodeId: string
    message: string
  }[]
}

export interface WorkflowExecutionStatus {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error'
  currentNodeId?: string
  error?: string
  history: {
    nodeId: string
    timestamp: number
    status: 'completed' | 'error'
    error?: string
  }[]
}