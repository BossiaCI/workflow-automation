import { WorkflowNode, WorkflowEdge } from './types'

interface LayoutOptions {
  nodeWidth: number
  nodeHeight: number
  horizontalSpacing: number
  verticalSpacing: number
}

const defaultOptions: LayoutOptions = {
  nodeWidth: 150,
  nodeHeight: 40,
  horizontalSpacing: 100,
  verticalSpacing: 100,
}

export function autoLayout(nodes: WorkflowNode[], edges: WorkflowEdge[], options: Partial<LayoutOptions> = {}) {
  const opts = { ...defaultOptions, ...options }
  const levels = calculateLevels(nodes, edges)
  const nodesPerLevel = groupNodesByLevel(nodes, levels)
  
  // Calculate positions
  nodesPerLevel.forEach((levelNodes, level) => {
    const levelWidth = levelNodes.length * (opts.nodeWidth + opts.horizontalSpacing)
    const startX = -levelWidth / 2
    
    levelNodes.forEach((nodeId, index) => {
      const node = nodes.find(n => n.id === nodeId)
      if (node) {
        node.position = {
          x: startX + index * (opts.nodeWidth + opts.horizontalSpacing),
          y: level * (opts.nodeHeight + opts.verticalSpacing)
        }
      }
    })
  })

  return nodes
}

function calculateLevels(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  const levels: Record<string, number> = {}
  const startNode = nodes.find(node => node.type === 'start')
  
  if (!startNode) return levels
  
  // Initialize with start node
  levels[startNode.id] = 0
  let changed = true
  
  // Iterate until no changes are made
  while (changed) {
    changed = false
    edges.forEach(edge => {
      const sourceLevel = levels[edge.source]
      const targetLevel = levels[edge.target]
      
      if (sourceLevel !== undefined) {
        const newLevel = sourceLevel + 1
        if (targetLevel === undefined || newLevel > targetLevel) {
          levels[edge.target] = newLevel
          changed = true
        }
      }
    })
  }
  
  return levels
}

function groupNodesByLevel(nodes: WorkflowNode[], levels: Record<string, number>) {
  const nodesPerLevel: string[][] = []
  
  Object.entries(levels).forEach(([nodeId, level]) => {
    if (!nodesPerLevel[level]) {
      nodesPerLevel[level] = []
    }
    nodesPerLevel[level].push(nodeId)
  })
  
  return nodesPerLevel
}