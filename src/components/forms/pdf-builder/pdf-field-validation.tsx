import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

interface PdfFieldValidationProps {
  formId: string
  templateId: string
  mappings: any[]
  pageSize: { width: number; height: number }
}

export function PdfFieldValidation({
  formId,
  templateId,
  mappings,
  pageSize,
}: PdfFieldValidationProps) {
  const [validation, setValidation] = useState<ValidationResult>()
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    validateMappings()
  }, [mappings, pageSize])

  const validateMappings = async () => {
    try {
      setIsValidating(true)
      const response = await fetch(`/api/forms/${formId}/pdf-mappings/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mappings, pageSize }),
      })

      if (!response.ok) throw new Error('Validation failed')
      const result = await response.json()
      setValidation(result)
    } catch (error) {
      console.error('Validation error:', error)
      setValidation({
        isValid: false,
        errors: ['Failed to validate field mappings'],
      })
    } finally {
      setIsValidating(false)
    }
  }

  if (isValidating) {
    return <div className="text-sm text-muted-foreground">Validating...</div>
  }

  if (!validation) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {validation.isValid ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-destructive" />
        )}
        <span className={validation.isValid ? 'text-green-600' : 'text-destructive'}>
          {validation.isValid ? 'All mappings are valid' : 'Validation errors found'}
        </span>
      </div>

      {!validation.isValid && validation.errors.length > 0 && (
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {validation.errors.map((error, index) => (
              <Alert key={index} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}