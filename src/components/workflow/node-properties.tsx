import { useWorkflowStore } from '@/lib/workflow/store'
import { WorkflowNode } from '@/lib/workflow/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WorkflowNodeValidation } from './workflow-node-validation'
import { WorkflowNodePreview } from './workflow-node-preview'
import { Textarea } from '@/components/ui/textarea'
import { PdfTemplateSelector } from './pdf-template-selector'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface NodePropertiesProps {
  node: WorkflowNode
  validation: {
    isValid: boolean
    errors: Array<{ nodeId: string; message: string }>
  }
}

export function NodeProperties({ node, validation }: NodePropertiesProps) {
  const { updateNode } = useWorkflowStore()

  const handlePropertyChange = (key: string, value: any) => {
    updateNode(node.id, {
      data: {
        ...node.data,
        properties: {
          ...node.data.properties,
          [key]: value,
        },
      },
    })
  }

  return (
    <Tabs defaultValue="properties">
      <TabsList>
        <TabsTrigger value="properties">Properties</TabsTrigger>
        <TabsTrigger value="validation">Validation</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="properties" className="space-y-4">
      <div>
        <h3 className="font-semibold">Node Properties</h3>
        <p className="text-sm text-muted-foreground">
          Configure the selected node&apos;s properties
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            value={node.data.label}
            onChange={(e) =>
              updateNode(node.id, {
                data: { ...node.data, label: e.target.value },
              })
            }
          />
        </div>

        {node.type === 'task' && (
          <div className="space-y-2">
            <Label>Action</Label>
            <Select
              value={node.data.properties?.action}
              onValueChange={(value) => handlePropertyChange('action', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="http">HTTP Request</SelectItem>
                <SelectItem value="function">Function</SelectItem>
                <SelectItem value="script">Script</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {node.type === 'condition' && (
          <div className="space-y-2">
            <Label>Condition</Label>
            <Textarea
              value={node.data.properties?.condition}
              onChange={(e) => handlePropertyChange('condition', e.target.value)}
              placeholder="Enter condition expression"
            />
          </div>
        )}

        {node.type === 'delay' && (
          <div className="space-y-2">
            <Label>Delay (seconds)</Label>
            <Input
              type="number"
              min="0"
              value={node.data.properties?.delay || 0}
              onChange={(e) =>
                handlePropertyChange('delay', parseInt(e.target.value))
              }
            />
          </div>
        )}

        {node.type === 'pdf' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>PDF Template</Label>
              <PdfTemplateSelector
                formId={node.data.properties?.formId}
                value={node.data.template?.id}
                onSelect={(template) => {
                  updateNode(node.id, {
                    data: {
                      ...node.data,
                      template: {
                        id: template.id,
                        name: template.name,
                      },
                    },
                  })
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Output Options</Label>
              <Select
                value={node.data.properties?.output || 'download'}
                onValueChange={(value) =>
                  handlePropertyChange('output', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select output type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="download">Download</SelectItem>
                  <SelectItem value="email">Send as Email</SelectItem>
                  <SelectItem value="store">Store in System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {node.type === 'email' && (
          <>
            <div className="space-y-2">
              <Label>Template</Label>
              <Select
                value={node.data.properties?.templateId}
                onValueChange={(value) =>
                  handlePropertyChange('templateId', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template1">Welcome Email</SelectItem>
                  <SelectItem value="template2">Confirmation</SelectItem>
                  <SelectItem value="template3">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recipients</Label>
              <Input
                value={node.data.properties?.recipients || ''}
                onChange={(e) =>
                  handlePropertyChange('recipients', e.target.value)
                }
                placeholder="Enter email addresses"
              />
            </div>
          </>
        )}
      </div>

      {node.data.validation?.message && (
        <div className="text-sm text-destructive">
          {node.data.validation.message}
        </div>
      )}
      </TabsContent>

      <TabsContent value="validation">
        <WorkflowNodeValidation node={node} validation={validation} />
      </TabsContent>

      <TabsContent value="preview">
        <WorkflowNodePreview node={node} />
      </TabsContent>
    </Tabs>
  )
}