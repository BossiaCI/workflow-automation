import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkflowStore } from './workflow-store'

export function WorkflowValidation() {
  const { validation } = useWorkflowStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {validation.isValid ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Workflow Valid
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-destructive" />
              Validation Errors
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {validation.errors.length > 0 ? (
          <div className="space-y-2">
            {validation.errors.map((error, index) => (
              <Alert key={index} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error.nodeId ? `Node ${error.nodeId}: ` : ''}{error.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No validation errors found
          </p>
        )}
      </CardContent>
    </Card>
  )
}