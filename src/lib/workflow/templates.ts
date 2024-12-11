import { WorkflowNodeType } from './types'

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  nodes: {
    type: WorkflowNodeType
    position: { x: number; y: number }
    data: Record<string, any>
  }[]
  edges: {
    source: string
    target: string
    data?: Record<string, any>
  }[]
}

export const workflowTemplates: Record<string, WorkflowTemplate> = {
  emailSequence: {
    id: 'email-sequence',
    name: 'Email Sequence',
    description: 'Basic email sequence workflow with delay and conditions',
    nodes: [
      {
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Start' }
      },
      {
        type: 'email',
        position: { x: 250, y: 100 },
        data: {
          label: 'Welcome Email',
          properties: {
            templateId: 'welcome',
            recipients: '${user.email}'
          }
        }
      },
      {
        type: 'delay',
        position: { x: 250, y: 200 },
        data: {
          label: 'Wait 2 Days',
          properties: {
            delay: 172800 // 2 days in seconds
          }
        }
      },
      {
        type: 'condition',
        position: { x: 250, y: 300 },
        data: {
          label: 'Opened Email?',
          properties: {
            condition: '${email.opened}'
          }
        }
      },
      {
        type: 'email',
        position: { x: 100, y: 400 },
        data: {
          label: 'Follow-up Email',
          properties: {
            templateId: 'followup',
            recipients: '${user.email}'
          }
        }
      },
      {
        type: 'end',
        position: { x: 400, y: 400 },
        data: { label: 'End' }
      }
    ],
    edges: [
      { source: 'start', target: 'welcome-email' },
      { source: 'welcome-email', target: 'delay' },
      { source: 'delay', target: 'condition' },
      { source: 'condition', target: 'followup-email', data: { condition: 'false' } },
      { source: 'condition', target: 'end', data: { condition: 'true' } },
      { source: 'followup-email', target: 'end' }
    ]
  },
  formSubmission: {
    id: 'form-submission',
    name: 'Form Submission',
    description: 'Handle form submission with notifications and data processing',
    nodes: [
      {
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Form Submitted' }
      },
      {
        type: 'task',
        position: { x: 250, y: 100 },
        data: {
          label: 'Validate Data',
          properties: {
            action: 'function',
            function: 'validateFormData'
          }
        }
      },
      {
        type: 'condition',
        position: { x: 250, y: 200 },
        data: {
          label: 'Is Valid?',
          properties: {
            condition: '${validation.success}'
          }
        }
      },
      {
        type: 'email',
        position: { x: 100, y: 300 },
        data: {
          label: 'Error Notification',
          properties: {
            templateId: 'validation-error',
            recipients: '${form.email}'
          }
        }
      },
      {
        type: 'task',
        position: { x: 400, y: 300 },
        data: {
          label: 'Process Data',
          properties: {
            action: 'function',
            function: 'processFormData'
          }
        }
      },
      {
        type: 'email',
        position: { x: 400, y: 400 },
        data: {
          label: 'Success Confirmation',
          properties: {
            templateId: 'submission-success',
            recipients: '${form.email}'
          }
        }
      },
      {
        type: 'end',
        position: { x: 250, y: 500 },
        data: { label: 'End' }
      }
    ],
    edges: [
      { source: 'start', target: 'validate' },
      { source: 'validate', target: 'condition' },
      { source: 'condition', target: 'error-email', data: { condition: 'false' } },
      { source: 'condition', target: 'process', data: { condition: 'true' } },
      { source: 'error-email', target: 'end' },
      { source: 'process', target: 'success-email' },
      { source: 'success-email', target: 'end' }
    ]
  }
}