import Handlebars from 'handlebars'
import mjml2html from 'mjml'

export function compileTemplate(template: any, data: any) {
  // Register custom Handlebars helpers
  Handlebars.registerHelper('formatDate', function(date: Date, format: string) {
    return new Date(date).toLocaleDateString(undefined, {
      year: format.includes('YYYY') ? 'numeric' : undefined,
      month: format.includes('MM') ? 'long' : undefined,
      day: format.includes('DD') ? 'numeric' : undefined,
    })
  })

  Handlebars.registerHelper('formatCurrency', function(amount: number, currency: string = 'USD') {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount)
  })

  const subject = Handlebars.compile(template.subject)(data)
  let html: string

  if (template.mjmlTemplate) {
    // Compile MJML template with Handlebars
    const compiledMjml = Handlebars.compile(template.mjmlTemplate)(data)
    const { html: mjmlHtml } = mjml2html(compiledMjml, {
      keepComments: false,
      beautify: false,
    })
    html = mjmlHtml
  } else {
    html = Handlebars.compile(template.body)(data)
  }

  const text = stripHtml(html)

  return {
    subject,
    html,
    text,
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}