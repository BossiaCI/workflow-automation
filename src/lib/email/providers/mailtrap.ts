import nodemailer from 'nodemailer'
import { EmailProvider } from '@prisma/client'
import { EmailOptions } from '../types'

export class MailtrapProvider implements EmailProvider {
  private transporter: nodemailer.Transporter

  constructor(apiKey: string) {
    this.transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: apiKey.split(':')[0],
        pass: apiKey.split(':')[1],
      },
    })
  }

  async send(options: EmailOptions) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${options.fromName}" <${options.from}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
      })

      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (error) {
      console.error('Mailtrap error:', error)
      throw error
    }
  }
}