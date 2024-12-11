export interface EmailOptions {
  to: string
  from: string
  fromName: string
  subject: string
  html: string
  text: string
  replyTo?: string
  trackOpens?: boolean
  trackClicks?: boolean
  metadata?: Record<string, any>
}

export interface EmailProviderResponse {
  success: boolean
  messageId?: string
  error?: any
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<EmailProviderResponse>
}