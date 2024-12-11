import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { WorkflowNode } from '@/lib/workflow/types'
import { ScrollArea } from '@/components/ui/scroll-area'

interface NodeValidationProps {
  node: WorkflowNode
  validation: {
    isValid: boolean
    errors: Array<{ nodeId: string; message: string }>
  }
}

export function WorkflowNodeValidation({ node, validation }: NodeValidationProps) {
  const nodeErrors = validation.errors.filter(error => error.nodeId === node.id)
  const isValid = nodeErrors.length === 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {isValid ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-destructive" />
        )}
        <span className={isValid ? 'text-green-600' : 'text-destructive'}>
          {isValid ? 'Node configuration is valid' : 'Validation errors found'}
        </span>
      </div>

      {!isValid && (
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {nodeErrors.map((error, index) => (
              <Alert key={index} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}