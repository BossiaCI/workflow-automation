import { WorkflowNode, WorkflowEdge, WorkflowExecutionStatus } from './types'
import { EmailService } from '../email/email-service'
import { generatePdfWithMappings } from '../pdf/generator'
import { db } from '../db'

export class WorkflowExecutor {
  private nodes: WorkflowNode[]
  private edges: WorkflowEdge[]
  private emailService: EmailService
  private executionStatus: WorkflowExecutionStatus
  private context: Record<string, any>

  constructor(nodes: WorkflowNode[], edges: WorkflowEdge[], context: Record<string, any> = {}) {
    this.nodes = nodes
    this.edges = edges
    this.context = context
    this.executionStatus = {
      status: 'idle',
      history: [],
    }
  }

  async execute() {
    const startNode = this.nodes.find(node => node.type === 'start')
    if (!startNode) throw new Error('No start node found')

    this.executionStatus = {
      status: 'running',
      currentNodeId: startNode.id,
      history: [],
    }

    try {
      await this.executeNode(startNode)
      this.executionStatus.status = 'completed'
    } catch (error) {
      this.executionStatus.status = 'error'
      this.executionStatus.error = error.message
    }

    return this.executionStatus
  }

  private async executeNode(node: WorkflowNode) {
    // Record execution start
    this.executionStatus.currentNodeId = node.id
    const startTime = Date.now()
    
    try {
      switch (node.type) {
        case 'email':
          await this.executeEmailNode(node)
          break
        case 'pdf':
          await this.executePdfNode(node)
          break
        case 'delay':
          await this.executeDelayNode(node)
          break
        case 'condition':
          await this.executeConditionNode(node)
          break
        case 'task':
          await this.executeTaskNode(node)
          break
      }

      // Record successful execution
      this.executionStatus.history.push({
        nodeId: node.id,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        status: 'completed',
      })

      // Find and execute next node
      const nextNodes = this.getNextNodes(node)
      for (const nextNode of nextNodes) {
        await this.executeNode(nextNode)
      }
    } catch (error) {
      this.executionStatus.history.push({
        nodeId: node.id,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        status: 'error',
        error: error.message,
      })
      throw error
    }
  }

  private async executeEmailNode(node: WorkflowNode) {
    const { templateId, recipients } = node.data.properties
    
    // Validate required properties
    if (!templateId || !recipients) {
      throw new Error('Missing required email properties')
    }

    // Get email template
    const template = await db.emailTemplate.findUnique({
      where: { id: templateId },
    })
    if (!template) throw new Error(`Email template ${templateId} not found`)

    // Initialize email service with user's settings
    const emailSettings = await db.emailSettings.findFirst({
      where: { userId: this.context.userId },
    })
    if (!emailSettings) throw new Error('Email settings not configured')

    this.emailService = new EmailService(emailSettings.provider, emailSettings.apiKey)

    // Send email
    await this.emailService.sendEmail({
      to: this.evaluateExpression(recipients),
      from: emailSettings.fromEmail,
      fromName: emailSettings.fromName,
      subject: template.subject,
      html: template.body,
      text: template.body.replace(/<[^>]*>/g, ''),
      replyTo: emailSettings.replyTo,
      trackOpens: emailSettings.trackOpens,
      trackClicks: emailSettings.trackClicks,
      metadata: {
        workflowId: this.context.workflowId,
        nodeId: node.id,
        templateId,
        userId: this.context.userId,
      },
    })
  }

  private async executePdfNode(node: WorkflowNode) {
    const { template, output } = node.data
    if (!template?.id) {
      throw new Error('PDF template not configured')
    }

    // Get template details
    const pdfTemplate = await db.pdfTemplate.findUnique({
      where: { id: template.id },
    })

    if (!pdfTemplate) {
      throw new Error('PDF template not found')
    }

    // Generate PDF
    const pdfBuffer = await generatePdfWithMappings(
      pdfTemplate.elements,
      pdfTemplate.settings?.fieldMappings || [],
      this.context.formData
    )

    // Handle output based on configuration
    switch (output) {
      case 'email':
        await this.sendPdfByEmail(node, pdfBuffer)
        break
      case 'store':
        await this.storePdf(node, pdfBuffer)
        break
      case 'download':
      default:
        this.context.generatedPdf = pdfBuffer
        break
    }
  }

  private async sendPdfByEmail(node: WorkflowNode, pdfBuffer: Buffer) {
    const { recipients } = node.data.properties
    if (!recipients) {
      throw new Error('Recipients not configured for PDF email')
    }

    const emailSettings = await db.emailSettings.findFirst({
      where: { userId: this.context.userId },
    })

    if (!emailSettings) {
      throw new Error('Email settings not configured')
    }

    this.emailService = new EmailService(emailSettings.provider, emailSettings.apiKey)

    await this.emailService.sendEmail({
      to: this.evaluateExpression(recipients),
      from: emailSettings.fromEmail,
      fromName: emailSettings.fromName,
      subject: 'Generated PDF Document',
      html: 'Please find the generated PDF document attached.',
      text: 'Please find the generated PDF document attached.',
      attachments: [
        {
          filename: 'document.pdf',
          content: pdfBuffer,
        },
      ],
    })
  }

  private async storePdf(node: WorkflowNode, pdfBuffer: Buffer) {
    // Implement PDF storage logic
    // This could store in a file system, cloud storage, or database
    console.log('PDF storage not implemented')
  }

  private async executeDelayNode(node: WorkflowNode) {
    const delay = node.data.properties.delay * 1000 // Convert to milliseconds
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  private async executeConditionNode(node: WorkflowNode) {
    const condition = node.data.properties.condition
    
    if (!condition) {
      throw new Error('Missing condition expression')
    }

    const result = this.evaluateExpression(condition)
    this.context.conditionResult = result
    
    // Log condition evaluation
    this.context[`${node.id}_evaluation`] = {
      condition,
      result,
      timestamp: Date.now(),
    }
  }

  private async executeTaskNode(node: WorkflowNode) {
    const { action, function: functionName } = node.data.properties
    
    if (action === 'function') {
      // Execute predefined function
      const result = await this.executePredefinedFunction(functionName)
      this.context[`${node.id}_result`] = result
    } else if (action === 'http') {
      // Execute HTTP request
      // Implement HTTP request handling
    }
  }

  private getNextNodes(currentNode: WorkflowNode): WorkflowNode[] {
    const outgoingEdges = this.edges.filter(edge => edge.source === currentNode.id)
    
    if (currentNode.type === 'condition') {
      // For condition nodes, only follow the edge matching the condition result
      const matchingEdge = outgoingEdges.find(edge => 
        (edge.data?.condition === 'true' && this.context.conditionResult) ||
        (edge.data?.condition === 'false' && !this.context.conditionResult)
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

  private evaluateExpression(expression: string): any {
    // Simple expression evaluation using template literals
    try {
      const template = new Function('context', `with(context) { return \`${expression}\` }`)
      return template(this.context)
    } catch (error) {
      throw new Error(`Error evaluating expression: ${expression}`)
    }
  }

  private async executePredefinedFunction(functionName: string): Promise<any> {
    // Implement predefined function execution
    // This could be extended to support custom functions
    const functions: Record<string, Function> = {
      validateFormData: async () => {
        // Implement form validation logic
        return { success: true }
      },
      processFormData: async () => {
        // Implement form processing logic
        return { success: true }
      },
    }

    if (!functions[functionName]) {
      throw new Error(`Function ${functionName} not found`)
    }

    return functions[functionName](this.context)
  }
}