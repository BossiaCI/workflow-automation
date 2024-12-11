import { useFormBuilder } from "./form-builder-context"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateField } from "@/lib/validations/field-validation"

export function FormPreview() {
  const { formData } = useFormBuilder()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [startTime, setStartTime] = useState<number>(0)

  useEffect(() => {
    if (formData.id) {
      // Track form view
      fetch(`/api/forms/${formData.id}/analytics/view`, { method: 'POST' })
      // Start timing
      setStartTime(Date.now())
    }
  }, [formData.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id) return
    
    // Validate required fields
    const newErrors: Record<string, string> = {}
    formData.fields.forEach((field) => {
      if (field.required && !formValues[field.id]) {
        newErrors[field.id] = `${field.label} is required`
      }
    })
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setIsSubmitting(true)
      
      // Calculate time spent
      const timeSpent = (Date.now() - startTime) / 1000
      
      // Update analytics with completion time
      await fetch(`/api/forms/${formData.id}/analytics/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSpent }),
      })
      
      const response = await fetch(`/api/forms/${formData.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      })

      if (!response.ok) {
        throw new Error("Failed to submit form")
      }

      toast({
        title: "Success",
        description: "Form submitted successfully",
      })
      setFormValues({})
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit form",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    const field = formData.fields.find(f => f.id === fieldId)
    if (field) {
      const { valid, error } = validateField(value, field.type, field.validation)
      setErrors(prev => ({
        ...prev,
        [fieldId]: valid ? undefined : error
      }))
    }
    
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const renderField = (field: any) => {
    switch (field.type) {
      case "number":
      case "percentage":
        return (
          <Input
            type="number"
            value={formValues[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            step={field.type === "percentage" ? "1" : "any"}
          />
        )
      case "time":
        return (
          <Input
            type="time"
            value={formValues[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )
      case "address":
        return (
          <div className="space-y-4">
            {Object.entries(field.fields).map(([key, fieldConfig]: [string, any]) => (
              <div key={key} className="space-y-2">
                <Label>{fieldConfig.label}</Label>
                <Input
                  value={formValues[`${field.id}.${key}`] || ""}
                  onChange={(e) => handleFieldChange(`${field.id}.${key}`, e.target.value)}
                  required={fieldConfig.required}
                />
              </div>
            ))}
          </div>
        )
      case "text":
        return (
          <Input
            value={formValues[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )
      case "textarea":
        return (
          <Textarea
            value={formValues[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )
      // Add other field types here
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="space-y-2">
          <h1 className="text-2xl font-bold">{formData.title}</h1>
          <p className="text-muted-foreground">{formData.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderField(field)}
              {errors[field.id] && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors[field.id]}</AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}