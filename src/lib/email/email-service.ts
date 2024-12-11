import { db } from "@/lib/db"
import { EmailProvider, EmailStatus, EmailTemplateType, EmailTrigger } from "@prisma/client"
import { SendGridProvider } from "./providers/sendgrid"
import { MailtrapProvider } from "./providers/mailtrap"
import { compileTemplate } from "./template-compiler"
import { EmailOptions } from "./types"

export class EmailService {
  private provider: EmailProvider
  private retryQueue: Map<string, number> = new Map()

  constructor(provider: EmailProvider, apiKey: string) {
    this.provider = provider === "SENDGRID"
      ? new SendGridProvider(apiKey)
      : provider === "SES"
      ? new SESProvider(process.env.AWS_REGION!, {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        })
      : new MailtrapProvider(apiKey)
  }

  async sendEmail(options: EmailOptions) {
    try {
      // Check if email is in retry queue
      const retryCount = this.retryQueue.get(options.metadata?.messageId) || 0
      if (retryCount >= (options.metadata?.maxRetries || 3)) {
        throw new Error("Max retry attempts reached")
      }

      const result = await this.provider.send(options)
      
      const log = await db.emailLog.create({
        data: {
          userId: options.metadata?.userId,
          templateId: options.metadata?.templateId,
          workflowId: options.metadata?.workflowId,
          status: EmailStatus.SENT,
          subject: options.subject,
          recipient: options.to,
          deliveryAttempts: retryCount + 1,
          metadata: options.metadata,
        },
      })

      // Clear from retry queue if successful
      if (options.metadata?.messageId) {
        this.retryQueue.delete(options.metadata.messageId)
      }
      return result
    } catch (error) {
      const log = await db.emailLog.create({
        data: {
          userId: options.metadata?.userId,
          templateId: options.metadata?.templateId,
          workflowId: options.metadata?.workflowId,
          status: EmailStatus.FAILED,
          subject: options.subject,
          recipient: options.to,
          deliveryAttempts: (this.retryQueue.get(options.metadata?.messageId) || 0) + 1,
          errorDetails: error.message,
          lastAttempt: new Date(),
          nextAttempt: this.calculateNextRetry(options),
          metadata: { error: error.message, ...options.metadata },
        },
      })
      
      // Add to retry queue if retries are enabled
      if (options.metadata?.messageId && options.metadata?.maxRetries > 0) {
        this.retryQueue.set(
          options.metadata.messageId,
          (this.retryQueue.get(options.metadata.messageId) || 0) + 1
        )
        
        // Schedule retry
        this.scheduleRetry(options)
      }

      throw error
    }
  }

  private calculateNextRetry(options: EmailOptions): Date {
    const retryCount = this.retryQueue.get(options.metadata?.messageId) || 0
    const baseDelay = options.metadata?.retryDelay || 300 // 5 minutes
    const exponentialDelay = baseDelay * Math.pow(2, retryCount)
    
    return new Date(Date.now() + exponentialDelay * 1000)
  }

  private async scheduleRetry(options: EmailOptions) {
    const nextRetry = this.calculateNextRetry(options)
    const delay = nextRetry.getTime() - Date.now()

    setTimeout(() => {
      this.sendEmail(options).catch(console.error)
    }, delay)
  }

  async processWorkflow(trigger: EmailTrigger, data: any) {
    const workflows = await db.emailWorkflow.findMany({
      where: {
        trigger,
        active: true,
      },
      orderBy: {
        priority: 'desc',
      },
      include: {
        template: true,
      },
    })

    for (const workflow of workflows) {
      if (workflow.conditions) {
        const meetsConditions = this.evaluateConditions(workflow.conditions, data)
        if (!meetsConditions) continue
      }

      const compiledTemplate = compileTemplate(workflow.template, data)

      if (workflow.delay) {
        await this.scheduleEmail(workflow, compiledTemplate, data)
      } else {
        await this.sendEmail(compiledTemplate)
      }
    }
  }

  private evaluateConditions(conditions: Record<string, any>, data: any): boolean {
    return Object.entries(conditions).every(([field, condition]) => {
      const value = data[field]
      
      if (typeof condition === 'object') {
        return Object.entries(condition).every(([operator, expected]) => {
          switch (operator) {
            case '$eq': return value === expected
            case '$ne': return value !== expected
            case '$gt': return value > expected
            case '$gte': return value >= expected
            case '$lt': return value < expected
            case '$lte': return value <= expected
            case '$in': return Array.isArray(expected) && expected.includes(value)
            case '$nin': return Array.isArray(expected) && !expected.includes(value)
            case '$exists': return (value !== undefined) === expected
            case '$regex': return new RegExp(expected).test(value)
            default: return false
          }
        })
      }
      
      return value === condition
    })
  }

  private async scheduleEmail(workflow: any, template: any, data: any) {
    // Implement email scheduling logic
    // This could use a job queue system like Bull
  }
}