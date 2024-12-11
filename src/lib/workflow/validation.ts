import { WorkflowNode, WorkflowEdge, WorkflowValidation } from './types'

const NODE_TYPE_VALIDATIONS = {
  email: (node: WorkflowNode) => {
    const errors: string[] = []
    if (!node.data.properties?.templateId) {
      errors.push('Email template is required')
    }
    if (!node.data.properties?.recipients) {
      errors.push('Recipients are required')
    }
    return errors
  },
  pdf: (node: WorkflowNode) => {
    const errors: string[] = []
    if (!node.data.template?.id) {
      errors.push('PDF template is required')
    }
    if (!node.data.properties?.output) {
      errors.push('Output type is required')
    }
    if (node.data.properties?.output === 'email' && !node.data.properties?.recipients) {
      errors.push('Recipients are required for email output')
    }
    return errors
  },
  delay: (node: WorkflowNode) => {
    const errors: string[] = []
    if (!node.data.properties?.delay || node.data.properties.delay < 0) {
      errors.push('Valid delay duration is required')
    }
    return errors
  },
  condition: (node: WorkflowNode) => {
    const errors: string[] = []
    if (!node.data.properties?.condition) {
      errors.push('Condition expression is required')
    }
    return errors
  },
  task: (node: WorkflowNode) => {
    const errors: string[] = []
    if (!node.data.properties?.action) {
      errors.push('Task action is required')
    }
    if (node.data.properties?.action === 'function' && !node.data.properties?.function) {
      errors.push('Function name is required')
    }
    return errors
  },
}

export function validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowValidation {
  const errors: { nodeId: string; message: string }[] = []

  // Check for start node
  const startNodes = nodes.filter((node) => node.type === 'start')
  if (startNodes.length === 0) {
    errors.push({ nodeId: '', message: 'Workflow must have a start node' })
  } else if (startNodes.length > 1) {
    errors.push({ nodeId: '', message: 'Workflow can only have one start node' })
  }

  // Check for end node
  const endNodes = nodes.filter((node) => node.type === 'end')
  if (endNodes.length === 0) {
    errors.push({ nodeId: '', message: 'Workflow must have an end node' })
  }

  // Check for circular dependencies
  const hasCycle = detectCycle(nodes, edges)
  if (hasCycle) {
    errors.push({ nodeId: '', message: 'Workflow contains circular dependencies' })
  }

  // Validate individual nodes
  nodes.forEach((node) => {
    // Validate node-specific properties
    if (NODE_TYPE_VALIDATIONS[node.type]) {
      const nodeErrors = NODE_TYPE_VALIDATIONS[node.type](node)
      nodeErrors.forEach((error) => {
        errors.push({ nodeId: node.id, message: error })
      })
    }

    // Check required properties
    if (node.type === 'task' && !node.data.properties?.action) {
      errors.push({ nodeId: node.id, message: 'Task node must have an action' })
    }

    if (node.type === 'condition' && !node.data.properties?.condition) {
      errors.push({ nodeId: node.id, message: 'Condition node must have a condition' })
    }

    // Check node connections
    const outgoingEdges = edges.filter((edge) => edge.source === node.id)
    const incomingEdges = edges.filter((edge) => edge.target === node.id)

    if (node.type === 'start' && incomingEdges.length > 0) {
      errors.push({ nodeId: node.id, message: 'Start node cannot have incoming connections' })
    }

    if (node.type === 'end' && outgoingEdges.length > 0) {
      errors.push({ nodeId: node.id, message: 'End node cannot have outgoing connections' })
    }

    if (node.type === 'condition' && outgoingEdges.length !== 2) {
      errors.push({ nodeId: node.id, message: 'Condition node must have exactly two outputs' })
    }

    // Validate edge conditions for condition nodes
    if (node.type === 'condition') {
      const hasTrue = outgoingEdges.some(edge => edge.data?.condition === 'true')
      const hasFalse = outgoingEdges.some(edge => edge.data?.condition === 'false')
      
      if (!hasTrue || !hasFalse) {
        errors.push({ 
          nodeId: node.id, 
          message: 'Condition node must have both true and false paths' 
        })
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

function detectCycle(nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function dfs(nodeId: string): boolean {
    visited.add(nodeId)
    recursionStack.add(nodeId)

    const outgoingEdges = edges.filter((edge) => edge.source === nodeId)
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (dfs(edge.target)) return true
      } else if (recursionStack.has(edge.target)) {
        return true
      }
    }

    recursionStack.delete(nodeId)
    return false
  }

  const startNode = nodes.find((node) => node.type === 'start')
  if (startNode) {
    return dfs(startNode.id)
  }

  return false
}