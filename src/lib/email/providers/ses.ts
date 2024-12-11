import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { EmailProvider } from "@prisma/client"
import { EmailOptions } from "../types"

export class SESProvider implements EmailProvider {
  private client: SESClient

  constructor(region: string, credentials: { accessKeyId: string; secretAccessKey: string }) {
    this.client = new SESClient({
      region,
      credentials,
    })
  }

  async send(options: EmailOptions) {
    try {
      const command = new SendEmailCommand({
        Destination: {
          ToAddresses: [options.to],
        },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: options.html,
            },
            Text: {
              Charset: "UTF-8",
              Data: options.text,
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: options.subject,
          },
        },
        Source: `${options.fromName} <${options.from}>`,
        ReplyToAddresses: options.replyTo ? [options.replyTo] : undefined,
        ConfigurationSetName: options.trackOpens || options.trackClicks ? "EmailTracking" : undefined,
        Tags: [
          {
            Name: "EmailType",
            Value: options.metadata?.type || "Transactional",
          },
        ],
      })

      const response = await this.client.send(command)
      return {
        success: true,
        messageId: response.MessageId,
      }
    } catch (error) {
      console.error("SES error:", error)
      throw error
    }
  }
}