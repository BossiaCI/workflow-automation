import sgMail from '@sendgrid/mail'
import { EmailProvider } from '@prisma/client'
import { EmailOptions } from '../types'

export class SendGridProvider implements EmailProvider {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey)
  }

  async send(options: EmailOptions) {
    try {
      const msg = {
        to: options.to,
        from: {
          email: options.from,
          name: options.fromName,
        },
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        trackingSettings: {
          clickTracking: { enable: options.trackClicks },
          openTracking: { enable: options.trackOpens },
        },
      }

      const response = await sgMail.send(msg)
      return {
        success: true,
        messageId: response[0]?.headers['x-message-id'],
      }
    } catch (error) {
      console.error('SendGrid error:', error)
      throw error
    }
  }
}