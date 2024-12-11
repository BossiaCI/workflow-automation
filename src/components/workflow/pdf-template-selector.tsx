import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface PdfTemplate {
  id: string
  name: string
}

interface PdfTemplateSelectorProps {
  formId: string
  value?: string
  onSelect: (template: PdfTemplate) => void
}

export function PdfTemplateSelector({
  formId,
  value,
  onSelect,
}: PdfTemplateSelectorProps) {
  const [templates, setTemplates] = useState<PdfTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (formId) {
      fetchTemplates()
    }
  }, [formId])

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/forms/${formId}/pdf-templates`)
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!formId) {
    return <div className="text-sm text-muted-foreground">Form ID required</div>
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading templates...
      </div>
    )
  }

  return (
    <Select value={value} onValueChange={(value) => {
      const template = templates.find(t => t.id === value)
      if (template) {
        onSelect(template)
      }
    }}>
      <SelectTrigger>
        <SelectValue placeholder="Select template" />
      </SelectTrigger>
      <SelectContent>
        {templates.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            {template.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}