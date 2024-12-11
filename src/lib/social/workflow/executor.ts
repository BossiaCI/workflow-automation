import { Node, Edge } from 'reactflow'
import { SocialPlatform } from '@prisma/client'
import { WorkflowManager } from '../workflow-manager'
import { ContentOptimizer } from '../content-optimizer'

interface ExecutionContext {
  userId: string
  variables: Record<string, any>
  history: Array<{
    nodeId: string
    timestamp: number
    status: 'completed' | 'error'
    error?: string
  }>
}

export class WorkflowExecutor {
  private nodes: Node[]
  private edges: Edge[]
  private context: ExecutionContext
  private workflowManager: WorkflowManager

  constructor(nodes: Node[], edges: Edge[], userId: string) {
    this.nodes = nodes
    this.edges = edges
    this.context = {
      userId,
      variables: {},
      history: [],
    }
    this.workflowManager = new WorkflowManager()
  }

  async execute() {
    const startNode = this.nodes.find(node => node.type === 'start')
    if (!startNode) throw new Error('No start node found')

    try {
      await this.executeNode(startNode)
      return {
        success: true,
        history: this.context.history,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        history: this.context.history,
      }
    }
  }

  private async executeNode(node: Node) {
    const startTime = Date.now()

    try {
      switch (node.type) {
        case 'post':
          await this.executePostNode(node)
          break
        case 'delay':
          await this.executeDelayNode(node)
          break
        case 'condition':
          await this.executeConditionNode(node)
          break
        case 'action':
          await this.executeActionNode(node)
          break
      }

      this.context.history.push({
        nodeId: node.id,
        timestamp: startTime,
        status: 'completed',
      })

      // Find and execute next nodes
      const nextNodes = this.getNextNodes(node)
      for (const nextNode of nextNodes) {
        await this.executeNode(nextNode)
      }
    } catch (error) {
      this.context.history.push({
        nodeId: node.id,
        timestamp: startTime,
        status: 'error',
        error: error.message,
      })
      throw error
    }
  }

  private async executePostNode(node: Node) {
    const { platform, content, hashtags, scheduledFor } = node.data

    // Optimize content for platform
    const optimized = ContentOptimizer.optimizeForPlatform(
      content,
      platform as SocialPlatform,
      hashtags
    )

    // Create and schedule post
    await this.workflowManager.createPost({
      userId: this.context.userId,
      content: optimized.content,
      hashtags: optimized.hashtags,
      platforms: [platform],
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    })
  }

  private async executeDelayNode(node: Node) {
    const delay = node.data.delay || 0
    await new Promise(resolve => setTimeout(resolve, delay * 1000))
  }

  private async executeConditionNode(node: Node) {
    const { condition } = node.data
    if (!condition) throw new Error('Condition not specified')

    try {
      // Evaluate condition using context variables
      const result = new Function('context', `with(context) { return ${condition} }`)
      this.context.variables.conditionResult = result(this.context.variables)
    } catch (error) {
      throw new Error(`Error evaluating condition: ${error.message}`)
    }
  }

  private async executeActionNode(node: Node) {
    const { action, params } = node.data
    if (!action) throw new Error('Action not specified')

    // Execute predefined action
    switch (action) {
      case 'updateAnalytics':
        await this.workflowManager.updateAnalytics(params.postId)
        break
      // Add more actions as needed
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  }

  private getNextNodes(currentNode: Node): Node[] {
    const outgoingEdges = this.edges.filter(edge => edge.source === currentNode.id)
    
    if (currentNode.type === 'condition') {
      // For condition nodes, only follow the edge matching the condition result
      const conditionResult = this.context.variables.conditionResult
      const matchingEdge = outgoingEdges.find(edge => 
        (edge.sourceHandle === 'true' && conditionResult) ||
        (edge.sourceHandle === 'false' && !conditionResult)
      )
      
      if (!matchingEdge) return []
      const nextNode = this.nodes.find(node => node.id === matchingEdge.target)
      return nextNode ? [nextNode] : []
    }

    // For other nodes, follow all outgoing edges
    return outgoingEdges
      .map(edge => this.nodes.find(node => node.id === edge.target))
      .filter(Boolean)
  }
}